import type { Level } from "@/domain/types";
import { cn } from "@/lib/utils";
import { BookRow } from "./BookRow";
import type { BookSideName } from "./bookView";

type BookSideProps = {
	side: BookSideName;
	levels: (Level | null)[];
	maxTotal: number;
	szDecimals: number;
};

export function BookSide({
	side,
	levels,
	maxTotal,
	szDecimals,
}: BookSideProps) {
	return (
		<div
			className={cn(
				"flex shrink-0 gap-0.5",
				side === "ask" ? "flex-col-reverse" : "flex-col",
			)}
			// Fixed to the row count (h-5 rows + gap-0.5 gaps), so the block's height never
			// depends on how many levels the book has or on the parent's available space.
			style={{
				height: `calc(${levels.length} * 1.25rem + ${levels.length - 1} * 0.125rem)`,
			}}
		>
			{levels.map((level, i) => (
				// Keyed by position, not price: row 3 stays row 3 while its contents change, so
				// React patches text in place instead of remounting rows as prices move.
				<BookRow
					// biome-ignore lint/suspicious/noArrayIndexKey: Expected, see explanation above.
					key={i}
					side={side}
					level={level}
					maxTotal={maxTotal}
					szDecimals={szDecimals}
				/>
			))}
		</div>
	);
}
