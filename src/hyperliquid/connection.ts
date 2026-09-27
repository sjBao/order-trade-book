import type { Status } from "@/domain/types";
import type { WsDataMessage, WsMessage } from "./wire";

export type ConnectionHandlers = {
	onMessage(message: WsDataMessage): void;
	onStatus(status: Status): void;
};

const PING_INTERVAL_MS = 10_000;
const SILENCE_LIMIT_MS = 25_000;
const BACKOFF_MIN_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;

export function createWsConnection(
	url: string,
	{ onMessage, onStatus }: ConnectionHandlers,
) {
	let socket: WebSocket | null = null;
	let attempts = 0,
		lastMessageAt = 0;
	let heartbeat: ReturnType<typeof setInterval> | undefined,
		retryTimer: ReturnType<typeof setTimeout> | undefined;

	function send(message: object) {
		if (socket?.readyState === WebSocket.OPEN)
			socket?.send(JSON.stringify(message));
	}

	function connect() {
		if (!navigator.onLine) return onStatus("offline");

		onStatus(attempts === 0 ? "connecting" : "reconnecting");
		socket = new WebSocket(url);
		socket.onopen = handleOpen;
		socket.onclose = handleClose;

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

	function handleOpen() {
		attempts = 0;
		lastMessageAt = Date.now();
		onStatus("open");
		heartbeat = setInterval(checkHeartbeat, PING_INTERVAL_MS);
	}

	function checkHeartbeat() {
		if (Date.now() - lastMessageAt > SILENCE_LIMIT_MS) {
			dropSocket();
			scheduleReconnect();
			return;
		}
		send({ method: "ping" });
	}

	function dropSocket() {
		clearInterval(heartbeat);
		clearTimeout(retryTimer);
		if (!socket) return;
		socket.onopen = socket.onmessage = socket.onclose = null;
		socket.close(1000);
		socket = null;
	}

	function handleOffline() {
		dropSocket();
		onStatus("offline");
	}

	function handleOnline() {
		dropSocket();
		attempts = 0;
		connect();
	}

	function scheduleReconnect() {
		onStatus("reconnecting");
		retryTimer = setTimeout(() => {
			attempts++;
			connect();
		}, backoffDelay(attempts));
	}

	function backoffDelay(attempt: number): number {
		return (
			Math.min(BACKOFF_MAX_MS, BACKOFF_MIN_MS * 2 ** attempt) *
			(0.5 + Math.random())
		);
	}

	function handleClose() {
		clearInterval(heartbeat);
		socket = null;
		scheduleReconnect();
	}

	window.addEventListener("offline", handleOffline);
	window.addEventListener("online", handleOnline);
	connect();
}
