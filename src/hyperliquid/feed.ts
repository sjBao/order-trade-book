import type { MarketFeed } from "@/domain/feed";
import type { Status } from "@/domain/types";
import { createWsConnection } from "./connection";
import { fetchCandleHistorySnapshot } from "./fetchCandleHistorySnapshot";
import { parseBook, parseCandle, parseTrade } from "./parse";
import { messageKey, subscriptionKey } from "./subscriptionKey";
import type { WsDataMessage, WsSubscription } from "./wire";

type Endpoints = { wsUrl: string; infoUrl: string };
type MessageListener = (message: WsDataMessage) => void;

export function createHyperLiquidFeed({
	wsUrl,
	infoUrl,
}: Endpoints): MarketFeed {
	let lastStatus: Status | null = null;
	const marketListeners = new Map<string, Set<MessageListener>>();
	const statusListeners = new Set<(message: Status) => void>();
	const connection = createWsConnection(wsUrl, {
		onMessage(message) {
			const key = messageKey(message);

			if (key)
				marketListeners.get(key)?.forEach((listener) => listener(message));
		},
		onStatus(status) {
			lastStatus = status;
			statusListeners.forEach((listener) => listener(status));
		},
	});

	function listenToMarket(
		subscription: WsSubscription,
		listener: MessageListener,
	) {
		const key = subscriptionKey(subscription);
		const keyListeners =
			marketListeners?.get(key) ?? new Set<MessageListener>();

		if (keyListeners.size === 0) {
			marketListeners?.set(key, keyListeners);
			connection.subscribe(subscription);
		}
		keyListeners.add(listener);

		return () => {
			keyListeners.delete(listener);
			if (keyListeners.size > 0) return;
			// no component is listening anymore, unsub from server
			marketListeners?.delete(key);
			connection.unsubscribe(subscription);
		};
	}

	return {
		onBook(coin, listener) {
			return listenToMarket({ type: "l2Book", coin }, (message) => {
				if (message.channel === "l2Book") listener(parseBook(message.data));
			});
		},

		onTrade(coin, listener) {
			return listenToMarket({ type: "trades", coin }, (message) => {
				if (message.channel === "trades")
					listener(message.data.map(parseTrade));
			});
		},

		onCandle(coin, interval, listener) {
			return listenToMarket({ type: "candle", coin, interval }, (message) => {
				if (message.channel === "candle") listener(parseCandle(message.data));
			});
		},

		async fetchCandles(coin, interval, signal) {
			const candles = await fetchCandleHistorySnapshot(
				infoUrl,
				coin,
				interval,
				signal,
			);
			return candles.map(parseCandle);
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
