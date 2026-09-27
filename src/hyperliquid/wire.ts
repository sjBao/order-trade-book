export const TESTNET_WS = "wss://api.hyperliquid-testnet.xyz/ws";
export const TESTNET_INFO = "https://api.hyperliquid-testnet.xyz/info";

export type Interval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export const INTERVAL_MS: Record<Interval, number> = {
	"1m": 60_000,
	"5m": 5 * 60_000,
	"15m": 15 * 60_000,
	"1h": 60 * 60_000,
	"4h": 4 * 60 * 60_000,
	"1d": 24 * 60 * 60_000,
};

export type WsLevel = { px: string; sz: string; n: number };

export type WsBook = {
	coin: string;
	time: number;
	levels: [WsLevel[], WsLevel[]]; // [bids, asks], best first, 20 per side by default
};

export type WsTrade = {
	coin: string;
	side: "B" | "A"; // aggressor: B = buy, A = sell
	px: string;
	sz: string;
	time: number;
	hash: string;
	tid: number;
	users: [string, string];
};

export type WsCandle = {
	t: number; // open time, ms
	T: number; // close time, ms
	s: string; // coin
	i: Interval; // case-sensitive: "1M" would be a month
	o: string;
	c: string;
	h: string;
	l: string;
	v: string;
	n: number;
};

export type WsSubscription =
	| { type: "l2Book"; coin: string }
	| { type: "trades"; coin: string }
	| { type: "candle"; coin: string; interval: Interval };

export type WsDataMessage =
	| { channel: "l2Book"; data: WsBook }
	| { channel: "trades"; data: WsTrade[] }
	| { channel: "candle"; data: WsCandle };

export type WsMessage =
	| WsDataMessage
	| { channel: "pong" }
	| { channel: "subscriptionResponse"; data: unknown }
	| { channel: "error"; data: string };
