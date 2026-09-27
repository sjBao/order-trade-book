import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";

const WIDE = "(min-width: 1000px)";

type View = "chart" | "book" | "trades";

const LABEL: Record<View, string> = {
	chart: "Chart",
	book: "Order Book",
	trades: "Trades",
};

// Wide: chart | (book or trades), golden ratio. Narrow: one of the three, picked by tab.
export function AppLayout() {
	const wide = useMediaQuery(WIDE);
	const [view, setView] = useState<View>("chart");

	// On wide screens the chart sits beside the tabs, so "chart" falls back to the book.
	const panel: View = view === "trades" ? "trades" : "book";
	const tabs: View[] = wide ? ["book", "trades"] : ["chart", "book", "trades"];

	const tabList = (
		<TabsList className="shrink-0">
			{tabs.map((t) => (
				<TabsTrigger key={t} value={t} className="text-xs">
					{LABEL[t]}
				</TabsTrigger>
			))}
		</TabsList>
	);

	// Radix unmounts inactive TabsContent, so a hidden book or tape stops re-rendering.
	const panels = (
		<>
			<TabsContent value="book" className={cn(wide && "min-h-0")}>
				<div className="border border-white border-solid">Orderbook</div>
			</TabsContent>
			<TabsContent value="trades" className={cn(wide && "min-h-0")}>
				<div className="border border-white border-solid">Trades Tape</div>
			</TabsContent>
		</>
	);

	return (
		<Tabs
			asChild
			value={wide ? panel : view}
			onValueChange={(next) => setView(next as View)}
			// Layout classes go here, not on <main>: Tabs merges them with its own defaults,
			// while asChild would only concatenate classes put on the child.
			className={cn(
				"flex-1 gap-3",
				// The chart must fit the viewport, so it needs min-h-0 to shrink below its canvas.
				// Only a narrow book/trades view drops it, so a long list scrolls the page.
				(wide || view === "chart") && "min-h-0",
				// minmax(0, …): a bare `fr` track won't shrink below the chart canvas's pixel
				// width, so the chart's ResizeObserver would never see the container get smaller.
				wide
					? "grid grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)]"
					: "flex flex-col",
			)}
		>
			<main>
				{wide ? (
					<>
						<div className="grid min-h-0 grid-cols-1 grid-rows-1">
							<div className="border border-white border-solid">
								Candle Chart
							</div>
						</div>
						<div className="flex min-h-0 flex-col gap-2">
							{tabList}
							{panels}
						</div>
					</>
				) : (
					<>
						{tabList}
						{/* forceMount keeps the chart alive across tab switches, so it isn't rebuilt
						    and its visible range isn't lost. Crossing the breakpoint still remounts it. */}
						<TabsContent
							value="chart"
							forceMount
							className="grid min-h-0 grid-cols-1 grid-rows-1 data-[state=inactive]:hidden"
						>
							<div className="border border-white border-solid">
								Candle Chart
							</div>
						</TabsContent>
						{panels}
					</>
				)}
			</main>
		</Tabs>
	);
}
