import type { MarketFeed } from "@/domain/feed";
import type { Book, Level, Status } from "@/domain/types";
import { createWsConnection } from "./connection";
import { messageKey, subscriptionKey } from "./subscriptionKey";
import type { WsBook, WsDataMessage, WsLevel, WsSubscription } from "./wire";

type MessageListener = (message: WsDataMessage) => void;

export function createHyperLiquidFeed(wsUrl: string): MarketFeed {
	const lastStatus: Status | null = null;
	const marketListeners = new Map<string, Set<MessageListener>>();
	const statusListeners = new Set<(message: Status) => void>();
	const connection = createWsConnection(wsUrl, {
		onMessage(message) {
			const key = messageKey(message);

			marketListeners.get(key).forEach((listener) => listener(message));
		},
		onStatus(status) {
			statusListeners.forEach((listener) => listener(status));
		},
	});

	function listenToMarket(
		subscription: WsSubscription,
		listener: MessageListener,
	) {
		const key = subscriptionKey(subscription);
		const keyListeners = marketListeners.get(key) ?? new Set<MessageListener>();

		if (keyListeners.size === 0) {
			marketListeners.set(key, keyListeners);
			connection.subscribe(subscription);
		}
		keyListeners.add(listener);

		return () => {
			keyListeners.delete(listener);
			if (keyListeners.size > 0) return;
			// no component is listening anymore, unsub from server
			marketListeners.delete(key);
			connection.unsubscribe(subscription);
		};
	}

	return {
		onBook(coin, listener) {
			return listenToMarket({ type: "l2Book", coin }, (message) => {
				if (message.channel === "l2Book") listener(parseBook(message.data));
			});
		},

		onStatus(listener) {
			statusListeners.add(listener);
			if (lastStatus) listener(lastStatus);
			return () => {
				statusListeners.delete(listener);
			};
		},

		close: () => connection.close(),
	};
}

export function parseBook(book: WsBook): Book {
	const [bids, asks] = book.levels;
	return {
		coin: book.coin,
		time: book.time,
		bids: parseLevels(bids),
		asks: parseLevels(asks),
	};
}

/** Levels arrive best first, so a running sum gives each level's cumulative depth. */
function parseLevels(levels: WsLevel[]): Level[] {
	let total = 0;
	return levels.map(({ px, sz }) => {
		const size = Number(sz);
		total += size;
		return { px: Number(px), pxText: px, sz: size, total };
	});
}
