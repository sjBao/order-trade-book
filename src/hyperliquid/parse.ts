import type { Book, Level, Trade } from "@/domain/types";
import type { WsBook, WsLevel, WsTrade } from "./wire";

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

export function parseTrade(trade: WsTrade): Trade {
	return {
		id: trade.tid,
		coin: trade.coin,
		side: trade.side === "B" ? "buy" : "sell",
		px: Number(trade.px),
		pxText: trade.px,
		sz: Number(trade.sz),
		time: trade.time,
	};
}
