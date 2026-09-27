import { TAPE_COLUMNS } from "@/components/columns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { baseAsset } from "@/domain/format";
import type { Trade } from "@/domain/types";
import { cn } from "@/lib/utils";
import { useIsStale } from "@/stores/status";
import { useTrades } from "@/stores/trades";
import { Panel, RowSkeletons } from "../Panel";
import { TradeRow } from "./TradeRow";

export function TradesTape() {
	const trades = useTrades();
	const stale = useIsStale();

	return (
		<Panel
			title="Trades"
			stale={stale}
			className="h-full [contain:layout_paint] text-xs"
		>
			{trades ? <Tape trades={trades} /> : <RowSkeletons rows={12} />}
		</Panel>
	);
}

function Tape({ trades }: { trades: Trade[] }) {
	// The store resets on every market switch, so every trade here is for the selected market.
	const unit = trades[0] && baseAsset(trades[0].coin);

	return (
		// Panel's content slot is a plain block; this column lets the rows take only the
		// height left over after the header.
		<div className="flex h-full flex-col">
			<div className={cn(TAPE_COLUMNS, "h-6 shrink-0 text-muted-foreground")}>
				<span>Price</span>
				<span className="text-right">{unit ? `Size (${unit})` : "Size"}</span>
				<span>Side</span>
				<span className="text-right">Time</span>
			</div>
			{trades.length === 0 ? (
				<p className="p-3 text-center text-muted-foreground">No trades yet</p>
			) : (
				// Only the rows scroll; the column header stays put.
				<ScrollArea className="min-h-0 flex-1">
					{trades.map((trade) => (
						<TradeRow key={trade.id} trade={trade} />
					))}
				</ScrollArea>
			)}
		</div>
	);
}
