import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Book, Candle } from "@/domain/types";
import { createFakeFeed } from "@/testing/fakeFeed";
import { bookStore } from "./book";
import { candleHistoryStore } from "./candleHistoryStore";
import { createSession } from "./createSession";
import { latestCandleStore } from "./latestCandleStore";

// Stores publish on requestAnimationFrame, which Node doesn't have: queue the callbacks
// and run them when the test says a frame has passed.
let frames: FrameRequestCallback[] = [];
const nextFrame = () => frames.splice(0).forEach((callback) => callback(0));

beforeEach(() => {
	frames = [];
	vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
		frames.push(callback),
	);
	vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
	nextFrame(); // the stores are module singletons: leave nothing pending for the next test
	vi.unstubAllGlobals();
});

const book = (coin: string): Book => ({ coin, time: 0, bids: [], asks: [] });
const candle: Candle = {
	time: 60,
	open: 1,
	high: 1,
	low: 1,
	close: 1,
	volume: 1,
};

function openSession() {
	const fake = createFakeFeed();
	const session = createSession(fake.feed, "1m");
	fake.emitStatus("open");
	return { fake, session };
}

describe("createSession: switching markets", () => {
	it("unsubscribes the old market and clears its data", () => {
		const { fake, session } = openSession();
		session.selectMarket("BTC");
		fake.emitBook(book("BTC"));
		fake.emitCandle("BTC", candle);
		nextFrame();
		expect(bookStore.getSnapshot()?.coin).toBe("BTC");

		session.selectMarket("ETH");

		expect(fake.bookListeners("BTC")).toBe(0);
		expect(bookStore.getSnapshot()).toBeNull();
		// Left behind, the old live candle gets redrawn onto the new market's chart.
		expect(latestCandleStore.getSnapshot()).toBeNull();
	});

	it("aborts the old market's history request, so it can't land on the new chart", async () => {
		const { fake, session } = openSession();
		session.selectMarket("BTC");
		const btcHistory = fake.historyRequests[0];

		// Switch mid-reconnect: ETH's history waits for the socket, so no new request is
		// made that would cancel BTC's as a side effect. Only the teardown can abort it.
		fake.emitStatus("reconnecting");
		session.selectMarket("ETH");
		expect(fake.historyRequests).toHaveLength(1);
		expect(btcHistory.signal.aborted).toBe(true);

		btcHistory.resolve([candle]); // the response arrives anyway
		await Promise.resolve();
		nextFrame();
		expect(candleHistoryStore.getSnapshot()).toBeNull();
	});
});
