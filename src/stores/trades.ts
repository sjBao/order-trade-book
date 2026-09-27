import type { Trade } from "@/domain/types";
import { createStore, useStore } from "./createStore";

export const TAPE_LENGTH = 50;
export const tradesStore = createStore<Trade[]>();

export const useTrades = () => useStore(tradesStore);

export function mergeTrades(tape: Trade[] | null, batch: Trade[]): Trade[] {
	const seen = new Set(tape?.map((trade) => trade.id));
	const fresh = batch.filter((trade) => !seen.has(trade.id));
	// Same array back: useSyncExternalStore sees an unchanged snapshot and skips the render.
	if (tape && fresh.length === 0) return tape;

	return [...fresh, ...(tape ?? [])]
		.sort((a, b) => b.time - a.time)
		.slice(0, TAPE_LENGTH);
}
