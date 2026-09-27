// The composition root: the only module that knows both Hyperliquid and the stores.

import { CHART_INTERVAL, DEFAULT_MARKET } from "@/domain/market";
import { TESTNET_INFO, TESTNET_WS } from "@/hyperliquid/wire";
import { createSession } from "@/stores/createSession";
import { createHyperLiquidFeed } from "./hyperliquid/feed";

export const session = createSession(
	createHyperLiquidFeed({ wsUrl: TESTNET_WS, infoUrl: TESTNET_INFO }),
	CHART_INTERVAL,
);

session.selectMarket(DEFAULT_MARKET);

// Without this, every hot reload in dev would leave the previous socket running.
import.meta.hot?.dispose(() => session.close());
