import { describe, expect, it } from "vitest";
import type { Book, Level } from "@/domain/types";
import { toBookView } from "./bookView";

const level = (px: number, total: number): Level => ({
	px,
	pxText: String(px),
	sz: 1,
	total,
});

describe("toBookView", () => {
	it("pads a thin book and scales depth to the deepest visible level", () => {
		const book: Book = {
			coin: "BTC",
			time: 0,
			bids: [level(99, 1), level(98, 5)],
			asks: [level(101, 2)],
		};
		const view = toBookView(book, 3);

		expect(view.bids).toHaveLength(3);
		expect(view.bids[2]).toBeNull();
		expect(view.maxTotal).toBe(5);
		expect(view.spread?.absolute).toBe(2);
		expect(view.spread?.percent).toBeCloseTo(2);
	});

	it("has no spread when a side is empty, rather than a misleading number", () => {
		// Seen on testnet: xyz:NVDA with no asks at all.
		const book: Book = {
			coin: "xyz:NVDA",
			time: 0,
			bids: [level(255, 1)],
			asks: [],
		};
		expect(toBookView(book, 3).spread).toBeNull();
	});
});
