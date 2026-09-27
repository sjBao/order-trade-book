import type { MarketFeed } from "@/domain/feed";
import { DEFAULT_MARKET } from "@/domain/market";
import type { Coin, Unsubscribe } from "@/domain/types";
import { createHyperLiquidFeed } from "@/hyperliquid/feed";
import { TESTNET_WS } from "@/hyperliquid/wire";
import { bookStore } from "./book";
import { selectedCoinStore } from "./selectedCoinStore";
import { statusStore } from "./status";

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
	}

	return {
		selectMarket(coin) {
			teardownMarket();
			selectedCoinStore.set(coin);
			unsubscribeMarket = feed.onBook(coin, (book) => bookStore.set(book));
		},

		close() {
			teardownMarket();
			feed.close();
		},
	};
}

// session.ts: the composition root, unchanged in shape
export const session = createSession(createHyperLiquidFeed(TESTNET_WS));
session.selectMarket(DEFAULT_MARKET);
import.meta.hot?.dispose(() => session.close());
