import type { Interval } from "@/hyperliquid/wire";
import type { Coin } from "./types";

type MarketMeta = {
	szDecimals: number; // size precision, from Hyperliquid's `meta` endpoint
};

// Hardcoded for three markets; with more, fetch `meta` (and `{ dex: "xyz" }` for HIP-3) on load.
export const MARKET_META: Record<Coin, MarketMeta> = {
	BTC: { szDecimals: 5 },
	ETH: { szDecimals: 4 },
	SOL: { szDecimals: 2 },
	// A HIP-3 equity perp, kept on purpose: thin on testnet (one side is often empty),
	// so it doubles as the live case for the order book's empty-side handling.
	"xyz:NVDA": { szDecimals: 3 },
};

export const MARKETS: Coin[] = Object.keys(MARKET_META);
export const DEFAULT_MARKET: Coin = MARKETS[0];
export const CHART_INTERVAL: Interval = "1m";
