import type { Book, Coin, Status, Unsubscribe } from "./types";

export interface MarketFeed {
	onStatus(fn: (status: Status) => void): () => void;
	onBook(coin: Coin, fn: (book: Book) => void): Unsubscribe;
}
