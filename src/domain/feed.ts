import type { Book, Coin, Status, Trade, Unsubscribe } from "./types";

export interface MarketFeed {
	onStatus(fn: (status: Status) => void): () => void;
	onBook(coin: Coin, fn: (book: Book) => void): Unsubscribe;
	onTrade(coin: Coin, fn: (trade: Trade[]) => void): Unsubscribe;
	close(): void;
}
