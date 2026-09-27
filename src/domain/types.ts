export type Coin = string; // "BTC", "ETH", or a HIP-3 market like "xyz:NVDA"

export type Interval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export type Level = {
	px: number;
	pxText: string; // price exactly as the exchange sent it: display this, do maths on px
	sz: number;
	total: number; // cumulative size from the best price outward
};

export type Book = {
	coin: Coin;
	time: number; // ms
	bids: Level[]; // best (highest) first
	asks: Level[]; // best (lowest) first
};

export type Trade = {
	id: number;
	coin: Coin;
	side: "buy" | "sell"; // the aggressor (taker) side
	px: number;
	pxText: string;
	sz: number;
	time: number; // ms
};

export type Candle = {
	time: number; // bucket start, in SECONDS (what the chart expects)
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
};

// offline: the browser reports no network, so we wait for it instead of retrying
export type Status =
	| "connecting"
	| "open"
	| "reconnecting"
	| "offline"
	| "closed";

export type Unsubscribe = () => void;
