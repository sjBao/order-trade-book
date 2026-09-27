import { BOOK_COLUMNS } from "@/components/columns";
import { cn } from "@/lib/utils";
import type { BookView } from "./bookView";

type SpreadRowProps = {
	spread: BookView["spread"];
	priceDecimals: number;
};

export function SpreadRow({ spread, priceDecimals }: SpreadRowProps) {
	// With a side empty there is no spread: show a dash rather than claim a zero.
	return (
		<div className={cn(BOOK_COLUMNS, "my-0.5 h-6 bg-muted")}>
			<span className="text-muted-foreground">Spread</span>
			<span className="text-right">
				{spread ? spread.absolute.toFixed(priceDecimals) : "—"}
			</span>
			<span className="text-right">
				{spread ? `${spread.percent.toFixed(3)}%` : "—"}
			</span>
		</div>
	);
}
