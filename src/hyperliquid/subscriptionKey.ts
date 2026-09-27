import type { WsDataMessage, WsSubscription } from "./wire";

/**
 * One canonical string per subscription, built from its fields. Never JSON.stringify:
 * property order differs between call sites, and a subscribe/unsubscribe pair that yields
 * two different keys leaves a ghost subscription that gets replayed on every reconnect.
 */
export function subscriptionKey(sub: WsSubscription): string {
	switch (sub.type) {
		case "l2Book":
			return `l2Book:${sub.coin}`;
		case "trades":
			return `trades:${sub.coin}`;
		case "candle":
			return `candle:${sub.coin}:${sub.interval}`;
	}
}

/** The key of the subscription a data message belongs to, or null if it can't be told. */
export function messageKey(message: WsDataMessage): string | null {
	switch (message.channel) {
		case "l2Book":
			return subscriptionKey({ type: "l2Book", coin: message.data.coin });
		case "trades": {
			// A batch is always for one coin; an empty batch carries nothing to route.
			const coin = message.data[0]?.coin;
			return coin ? subscriptionKey({ type: "trades", coin }) : null;
		}
		case "candle":
			return subscriptionKey({
				type: "candle",
				coin: message.data.s,
				interval: message.data.i,
			});
	}
}
