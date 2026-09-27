import { INTERVAL_MS } from "@/domain/market";
import type { Coin, Interval } from "@/domain/types";
import type { WsCandle } from "./wire";

// Hard coded for now
const HISTORY_BARS = 300;

/** The last HISTORY_BARS candles from the REST API. The caller owns cancellation. */
export async function fetchCandleHistorySnapshot(
	infoUrl: string,
	coin: Coin,
	interval: Interval,
	signal: AbortSignal,
): Promise<WsCandle[]> {
	const response = await fetch(infoUrl, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			type: "candleSnapshot",
			req: {
				coin,
				interval,
				startTime: Date.now() - INTERVAL_MS[interval] * HISTORY_BARS,
			},
		}),
		signal,
	});
	if (!response.ok)
		throw new Error(`candleSnapshot failed: HTTP ${response.status}`);
	return response.json();
}
