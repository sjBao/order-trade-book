import type { MarketFeed } from "@/domain/feed";
import type { Book, Candle, Coin, Status, Trade } from "@/domain/types";

type Listeners<T> = Map<Coin, Set<(value: T) => void>>;

function listen<T>(map: Listeners<T>, coin: Coin, fn: (value: T) => void) {
	const set = map.get(coin) ?? new Set();
	map.set(coin, set);
	set.add(fn);
	return () => {
		set.delete(fn);
	};
}

function emit<T>(map: Listeners<T>, coin: Coin, value: T) {
	map.get(coin)?.forEach((fn) => fn(value));
}

type HistoryRequest = {
	coin: Coin;
	signal: AbortSignal;
	resolve(candles: Candle[]): void;
};

/** A MarketFeed the test drives by hand: emit data, change status, answer history requests. */
export function createFakeFeed() {
	const books: Listeners<Book> = new Map();
	const trades: Listeners<Trade[]> = new Map();
	const candles: Listeners<Candle> = new Map();
	const statusListeners = new Set<(status: Status) => void>();
	const historyRequests: HistoryRequest[] = [];

	const feed: MarketFeed = {
		onStatus(fn) {
			statusListeners.add(fn);
			return () => {
				statusListeners.delete(fn);
			};
		},
		onBook: (coin, fn) => listen(books, coin, fn),
		onTrade: (coin, fn) => listen(trades, coin, fn),
		onCandle: (coin, _interval, fn) => listen(candles, coin, fn),
		fetchCandles: (coin, _interval, signal) =>
			new Promise((resolve) => historyRequests.push({ coin, signal, resolve })),
		close() {},
	};

	return {
		feed,
		historyRequests,
		emitStatus: (status: Status) => statusListeners.forEach((fn) => fn(status)),
		emitBook: (book: Book) => emit(books, book.coin, book),
		emitCandle: (coin: Coin, candle: Candle) => emit(candles, coin, candle),
		/** How many book listeners a coin still has: 0 means it was unsubscribed. */
		bookListeners: (coin: Coin) => books.get(coin)?.size ?? 0,
	};
}
