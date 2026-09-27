import {
	CandlestickSeries,
	createChart,
	type UTCTimestamp,
} from "lightweight-charts";
import { type ReactNode, useEffect, useRef } from "react";
import { CHART_INTERVAL } from "@/domain/market";
import type { Candle } from "@/domain/types";
import {
	candleHistoryStore,
	useCandleHistory,
} from "@/stores/candleHistoryStore";
import { latestCandleStore } from "@/stores/latestCandleStore";
import { Panel } from "../Panel";
import { chartOptions, seriesOptions } from "./theme";

const toBar = (candle: Candle) => ({
	...candle,
	time: candle.time as UTCTimestamp,
});

export function CandleChart() {
	const container = useRef<HTMLDivElement>(null);
	const history = useCandleHistory(); // only for the overlays; the chart itself is fed below

	// The chart is driven imperatively, outside React: a live tick is one series.update(),
	// not a render. setData() replaces everything, so it runs only when the history changes
	// (a market switch or a reconnect).
	useEffect(() => {
		if (!container.current) return;
		const chart = createChart(container.current, {
			...chartOptions(),
			autoSize: true,
		});
		const series = chart.addSeries(CandlestickSeries, seriesOptions());
		let lastTime = 0;

		const drawLatest = () => {
			const candle = latestCandleStore.getSnapshot();
			// update() throws on a bar older than the last one drawn.
			if (!candle || candle.time < lastTime) return;
			series.update(toBar(candle));
			lastTime = candle.time;
		};

		const drawHistory = () => {
			const snapshot = candleHistoryStore.getSnapshot();
			const candles = snapshot?.status === "loaded" ? snapshot.candles : [];
			series.setData(candles.map(toBar));
			lastTime = candles.at(-1)?.time ?? 0;
			drawLatest();
		};

		drawHistory();
		const unsubscribes = [
			candleHistoryStore.subscribe(drawHistory),
			latestCandleStore.subscribe(drawLatest),
		];

		return () => {
			unsubscribes.forEach((unsubscribe) => unsubscribe());
			chart.remove();
		};
	}, []);

	return (
		<Panel title={`Chart · ${CHART_INTERVAL}`}>
			<div className="relative h-full min-h-72 w-full">
				<div ref={container} className="absolute inset-0" />
				{history === null && <Overlay>Loading chart…</Overlay>}
				{history?.status === "error" && (
					<Overlay>Couldn't load price history ({history.message})</Overlay>
				)}
			</div>
		</Panel>
	);
}

function Overlay({ children }: { children: ReactNode }) {
	return (
		<div
			role="status"
			className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-xs text-muted-foreground"
		>
			{children}
		</div>
	);
}
