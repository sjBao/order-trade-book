import type { Candle } from "@/domain/types";
import { createStore } from "./createStore";

// The live bar from the candle subscription. The chart reads it imperatively, not via a hook,
// because each tick goes to series.update() rather than through a React render.
export const latestCandleStore = createStore<Candle>();
