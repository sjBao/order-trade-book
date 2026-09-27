import { BOOK_COLUMNS } from "@/components/columns";
import { formatSize } from "@/domain/format";
import type { Level } from "@/domain/types";
import { cn } from "@/lib/utils";
import type { BookSideName } from "./bookView";

type BookRowProps = {
	side: BookSideName;
	level: Level | null; // null pads a thin book so the panel keeps its height
	maxTotal: number;
	szDecimals: number;
};

export function BookRow({ side, level, maxTotal, szDecimals }: BookRowProps) {
	if (!level) return <div className="h-5 shrink-0" />;

	return (
		<div className={cn(BOOK_COLUMNS, "relative h-5 shrink-0")}>
			{/* scaleX, not width: a transform is composited, so a moving bar never triggers layout. */}
			<div
				style={{ transform: `scaleX(${level.total / maxTotal})` }}
				className={cn(
					"absolute inset-0 origin-left",
					side === "ask" ? "bg-ask/15" : "bg-bid/15",
				)}
			/>
			{/* `relative` puts the text in the same paint layer as the absolute bar, so DOM
			    order applies and the text draws on top instead of under the tint. */}
			<span
				className={cn("relative", side === "ask" ? "text-ask" : "text-bid")}
			>
				{level.pxText}
			</span>
			<span className="relative text-right">
				{formatSize(level.sz, szDecimals)}
			</span>
			<span className="relative text-right">
				{formatSize(level.total, szDecimals)}
			</span>
		</div>
	);
}
