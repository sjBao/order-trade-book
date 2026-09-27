import type { Status } from "./types";

export interface MarketFeed {
	onStatus(fn: (status: Status) => void): () => void;
}
