import { describe, expect, it } from "vitest";
import { messageKey, subscriptionKey } from "./subscriptionKey";
import type { WsCandle } from "./wire";

describe("subscriptionKey", () => {
	it("doesn't depend on property order", () => {
		// JSON.stringify gives these two different keys, which left ghost subscriptions
		// that were replayed on every reconnect.
		expect(subscriptionKey({ type: "l2Book", coin: "BTC" })).toBe(
			subscriptionKey({ coin: "BTC", type: "l2Book" }),
		);
	});

	it("tells coins, channels and candle intervals apart", () => {
		const keys = [
			subscriptionKey({ type: "l2Book", coin: "BTC" }),
			subscriptionKey({ type: "l2Book", coin: "ETH" }),
			subscriptionKey({ type: "trades", coin: "BTC" }),
			subscriptionKey({ type: "candle", coin: "BTC", interval: "1m" }),
			subscriptionKey({ type: "candle", coin: "BTC", interval: "5m" }),
		];
		expect(new Set(keys).size).toBe(keys.length);
	});

	it("matches the key of the message a subscription produces, so routing finds it", () => {
		expect(
			messageKey({
				channel: "l2Book",
				data: { coin: "ETH", time: 0, levels: [[], []] },
			}),
		).toBe(subscriptionKey({ type: "l2Book", coin: "ETH" }));

		const candle = { s: "ETH", i: "1m" } as WsCandle;
		expect(messageKey({ channel: "candle", data: candle })).toBe(
			subscriptionKey({ type: "candle", coin: "ETH", interval: "1m" }),
		);
	});
});
