import type { MarketFeed } from "@/domain/feed";
import type { Coin, Status, Unsubscribe } from "@/domain/types";
import type { Interval } from "@/hyperliquid/wire";
import { bookStore } from "./book";
import { candleHistoryStore } from "./candleHistoryStore";
import { latestCandleStore } from "./latestCandleStore";
import { selectedCoinStore } from "./selectedCoinStore";
import { statusStore } from "./status";
import { mergeTrades, tradesStore } from "./trades";

export type Session = {
	selectMarket(coin: Coin): void;
	close(): void;
};

/**
 * Connects a feed to the stores. Switching markets unsubscribes the old book and clears
 * it before the new one starts, so the old market's book can never appear under the new one.
 */
export function createSession(feed: MarketFeed, interval: Interval): Session {
	let unsubscribeMarket: Unsubscribe | null = null;
	let coin: Coin | null = null;
	let status: Status | null = null;
	let historyRequest: AbortController | null = null;

	// Status belongs to the connection, not to a market, so it's wired once.
	feed.onStatus((next) => {
		const reopened = next === "open" && status !== "open";
		status = next;
		statusStore.set(next);

		if (reopened) loadCandleHistory();
	});

	function subscribeMarket(market: Coin): Unsubscribe {
		const unsubs = [
			feed.onBook(market, (book) => bookStore.set(book)),
			feed.onTrade(market, (newTrades) =>
				tradesStore.update((currentTrades) =>
					mergeTrades(currentTrades, newTrades),
				),
			),
			feed.onCandle(market, interval, (candle) =>
				latestCandleStore.set(candle),
			),
		];

		return () => unsubs.forEach((unsub) => unsub());
	}

	function loadCandleHistory() {
		if (!coin || status !== "open") return;
		historyRequest?.abort();
		const request = new AbortController();
		historyRequest = request;

		feed
			.fetchCandles(coin, interval, request.signal)
			.then((candles) => {
				if (!request.signal.aborted)
					candleHistoryStore.set({ status: "loaded", candles });
			})
			.catch((error: unknown) => {
				if (request.signal.aborted) return;
				const message = error instanceof Error ? error.message : String(error);
				candleHistoryStore.set({ status: "error", message });
			});
	}

	function teardownMarket() {
		historyRequest?.abort();
		unsubscribeMarket?.();
		unsubscribeMarket = null;
		bookStore.reset();
		tradesStore.reset();
		candleHistoryStore.reset();
	}

	return {
		selectMarket(next) {
			teardownMarket();
			selectedCoinStore.set(next);
			coin = next;
			unsubscribeMarket = subscribeMarket(next);
			loadCandleHistory();
		},

		close() {
			teardownMarket();
			feed.close();
		},
	};
}
