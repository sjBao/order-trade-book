import type { Interval } from "@/hyperliquid/wire";
import type { Book, Candle, Coin, Status, Trade, Unsubscribe } from "./types";

export interface MarketFeed {
	onStatus(fn: (status: Status) => void): () => void;
	onBook(coin: Coin, fn: (book: Book) => void): Unsubscribe;
	onTrade(coin: Coin, fn: (trade: Trade[]) => void): Unsubscribe;
	onCandle(
		coin: Coin,
		interval: Interval,
		fn: (candle: Candle) => void,
	): Unsubscribe;
	fetchCandles(
		coin: Coin,
		interval: Interval,
		signal: AbortSignal,
	): Promise<Candle[]>;
	close(): void;
}
