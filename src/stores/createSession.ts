import type { MarketFeed } from "@/domain/feed";
import type { Coin, Unsubscribe } from "@/domain/types";
import { bookStore } from "./book";
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
export function createSession(feed: MarketFeed): Session {
	let unsubscribeMarket: Unsubscribe | null = null;

	// Status belongs to the connection, not to a market, so it's wired once.
	feed.onStatus((status) => statusStore.set(status));

	function teardownMarket() {
		unsubscribeMarket?.();
		unsubscribeMarket = null;
		bookStore.reset();
		tradesStore.reset();
	}

	function subscribeMarket(market: Coin): Unsubscribe {
		const unsubs = [
			feed.onBook(market, (book) => bookStore.set(book)),
			feed.onTrade(market, (newTrades) =>
				tradesStore.update((currentTrades) =>
					mergeTrades(currentTrades, newTrades),
				),
			),
		];

		return () => unsubs.forEach((unsub) => unsub());
	}

	return {
		selectMarket(next) {
			teardownMarket();
			selectedCoinStore.set(next);

			unsubscribeMarket = subscribeMarket(next);
		},

		close() {
			teardownMarket();
			feed.close();
		},
	};
}
