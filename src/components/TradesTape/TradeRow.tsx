import { TAPE_COLUMNS } from "@/components/columns";
import { formatSize, formatTime } from "@/domain/format";
import { MARKET_META } from "@/domain/market";
import type { Trade } from "@/domain/types";
import { cn } from "@/lib/utils";

export function TradeRow({ trade }: { trade: Trade }) {
	const sideColor = trade.side === "buy" ? "text-bid" : "text-ask";

	return (
		<div className={cn(TAPE_COLUMNS, "h-5")}>
			<span className={sideColor}>{trade.pxText}</span>
			<span className="text-right">
				{formatSize(trade.sz, MARKET_META[trade.coin].szDecimals)}
			</span>
			{/* Side as text as well as colour: colour alone fails colour-blind readers. */}
			<span className={sideColor}>{trade.side === "buy" ? "Buy" : "Sell"}</span>
			<span className="text-right text-muted-foreground">
				{formatTime(trade.time)}
			</span>
		</div>
	);
}
