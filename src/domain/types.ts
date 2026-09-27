export type Coin = string; // "BTC", "ETH", or a HIP-3 market like "xyz:NVDA"

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

// offline: the browser reports no network, so we wait for it instead of retrying
export type Status =
	| "connecting"
	| "open"
	| "reconnecting"
	| "offline"
	| "closed";

export type Unsubscribe = () => void;
