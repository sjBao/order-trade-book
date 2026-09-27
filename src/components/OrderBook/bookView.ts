import type { Book, Level } from "@/domain/types";

export type BookSideName = "bid" | "ask";

export type BookView = {
	asks: (Level | null)[]; // best first, padded with null to `rows`
	bids: (Level | null)[];
	maxTotal: number; // the deepest visible cumulative size; depth bars scale against it
	spread: { absolute: number; percent: number } | null; // null when a side is empty
};

/**
 * What the order book panel draws: the top `rows` levels per side, padded so a thin book
 * still fills the panel, plus the numbers the depth bars and the spread row need.
 */
export function toBookView(book: Book, rows: number): BookView {
	const asks = book.asks.slice(0, rows);
	const bids = book.bids.slice(0, rows);
	const bestAsk = asks[0];
	const bestBid = bids[0];

	const mid = bestAsk && bestBid ? (bestAsk.px + bestBid.px) / 2 : null;
	const spread =
		bestAsk && bestBid && mid
			? {
					absolute: bestAsk.px - bestBid.px,
					percent: ((bestAsk.px - bestBid.px) / mid) * 100,
				}
			: null;

	return {
		asks: padTo(asks, rows),
		bids: padTo(bids, rows),
		maxTotal: Math.max(asks.at(-1)?.total ?? 0, bids.at(-1)?.total ?? 0),
		spread,
	};
}

function padTo(levels: Level[], rows: number): (Level | null)[] {
	return Array.from({ length: rows }, (_, i) => levels[i] ?? null);
}
