import { cn } from "cn";
import { baseAsset, maxPriceDecimals } from "@/domain/format";
import { MARKET_META } from "@/domain/market";
import type { Book } from "@/domain/types";
import { BOOK_COLUMNS } from "../columns";
import { BookSide } from "./Bookside";
import { toBookView } from "./bookView";
import { SpreadRow } from "./SpreadRow";

const ROWS_PER_SIDE = 11;

export function BookTable({ book }: { book: Book }) {
	const view = toBookView(book, ROWS_PER_SIDE);
	const { szDecimals } = MARKET_META[book.coin];
	const unit = baseAsset(book.coin);

	return (
		<div className="flex flex-col text-xs">
			<div className={cn(BOOK_COLUMNS, "h-6 text-muted-foreground")}>
				<span>Price</span>
				<span className="text-right">Size ({unit})</span>
				<span className="text-right">Total ({unit})</span>
			</div>
			<BookSide
				side="ask"
				levels={view.asks}
				maxTotal={view.maxTotal}
				szDecimals={szDecimals}
			/>
			<SpreadRow
				spread={view.spread}
				priceDecimals={maxPriceDecimals(szDecimals)}
			/>
			<BookSide
				side="bid"
				levels={view.bids}
				maxTotal={view.maxTotal}
				szDecimals={szDecimals}
			/>
		</div>
	);
}
