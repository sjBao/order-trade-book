import type { Candle } from "@/domain/types";
import { createStore, useStore } from "./createStore";

// null (the store's empty state) means loading.
export type CandleHistory =
	| { status: "loaded"; candles: Candle[] }
	| { status: "error"; message: string };

export const candleHistoryStore = createStore<CandleHistory>();

export const useCandleHistory = () => useStore(candleHistoryStore);
