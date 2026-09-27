import type { Status } from "@/domain/types";
import { subscriptionKey } from "./subscriptionKey";
import type { WsDataMessage, WsMessage, WsSubscription } from "./wire";

export type Connection = {
	subscribe(subscription: WsSubscription): void;
	unsubscribe(subscription: WsSubscription): void;
	close(): void;
};

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
): Connection {
	const active = new Map<string, WsSubscription>();
	let socket: WebSocket | null = null;
	let attempts = 0,
		lastMessageAt = 0;
	let closed = false;
	let heartbeat: ReturnType<typeof setInterval> | undefined,
		retryTimer: ReturnType<typeof setTimeout> | undefined;

	function send(message: object) {
		if (socket?.readyState === WebSocket.OPEN) {
			socket?.send(JSON.stringify(message));
		}
	}

	function connect() {
		if (closed) return;
		if (!navigator.onLine) return onStatus("offline");

		onStatus(attempts === 0 ? "connecting" : "reconnecting");
		socket = new WebSocket(url);
		socket.onopen = handleOpen;
		socket.onmessage = handleMessage;
		socket.onclose = handleClose;
	}

	function handleOpen() {
		attempts = 0;
		lastMessageAt = Date.now();
		for (const subscription of active.values())
			send({ method: "subscribe", subscription });
		heartbeat = setInterval(checkHeartbeat, PING_INTERVAL_MS);
		onStatus("open");
	}

	function handleMessage(event) {
		lastMessageAt = Date.now();

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
				console.error("Hyperliquid:", message.data);
				return;
			default:
				onMessage(message);
		}
	}

	function handleClose() {
		clearInterval(heartbeat);
		socket = null;
		scheduleReconnect();
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

	window.addEventListener("offline", handleOffline);
	window.addEventListener("online", handleOnline);
	connect();

	return {
		subscribe(subscription) {
			const key = subscriptionKey(subscription);
			active.set(key, subscription);
			send({ method: "subscribe", subscription });
		},

		unsubscribe(subscription) {
			const key = subscriptionKey(subscription);
			active.delete(key);
			send({ method: "unsubscribe", subscription });
		},

		close() {
			closed = true;
			window.removeEventListener("offline", handleOffline);
			window.removeEventListener("online", handleOnline);
			dropSocket();
			onStatus("closed");
		},
	};
}
