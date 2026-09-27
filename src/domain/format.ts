import type { Coin } from "./types";

const timeFmt = new Intl.DateTimeFormat(undefined, {
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
	hour12: false,
});

/** 14:03:27 in the viewer's local time */
export const formatTime = (ms: number) => timeFmt.format(ms);

/** Size with a fixed number of decimals (Hyperliquid's szDecimals per market) */
export const formatSize = (sz: number, decimals: number) =>
	sz.toFixed(decimals);

/** Hyperliquid perps allow at most 6 − szDecimals decimal places in a price (docs: tick and lot size) */
export const maxPriceDecimals = (szDecimals: number) => 6 - szDecimals;

/** The unit sizes are quoted in: "xyz:NVDA" → "NVDA", since the dex prefix isn't part of it. */
export const baseAsset = (coin: Coin) => coin.split(":").pop() ?? coin;
