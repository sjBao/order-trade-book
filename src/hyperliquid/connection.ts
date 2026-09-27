import type { Status } from "@/domain/types";
import type { WsDataMessage, WsMessage } from "./wire";

export type ConnectionHandlers = {
	onMessage(message: WsDataMessage): void;
	onStatus(status: Status): void;
};

const PING_INTERVAL_MS = 10_000;

export function createWsConnection(
	url: string,
	{ onMessage, onStatus }: ConnectionHandlers,
) {
	let socket: WebSocket | null = null;
	const attempts: number = 0;
	let _heartbeat: ReturnType<typeof setInterval> | undefined;

	function send(message: object) {
		if (socket?.readyState === WebSocket.OPEN)
			socket?.send(JSON.stringify(message));
	}

	function connect() {
		if (!navigator.onLine) return onStatus("offline");

		onStatus(attempts === 0 ? "connecting" : "reconnecting");
		socket = new WebSocket(url);

		socket.onopen = () => {
			_heartbeat = setInterval(() => {
				send({ channel: "ping" });
			}, PING_INTERVAL_MS);

			onStatus("open");
		};

		socket.onmessage = (event) => {
			let message: WsMessage;
			try {
				message = JSON.parse(event.data);
			} catch {
				console.warn("Hyperliquid: unparseable frame", event.data);
				return;
			}

			switch (message.channel) {
				case "pong":
				case "subscriptionResponse":
					return;
				case "error":
					return;

				default:
					onMessage(message);
			}
		};
	}

	connect();
}
