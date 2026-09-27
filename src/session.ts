// The composition root: the only module that knows both Hyperliquid and the stores.

import { DEFAULT_MARKET } from "@/domain/market";
import { TESTNET_WS } from "@/hyperliquid/wire";
import { createSession } from "@/stores/createSession";
import { createHyperLiquidFeed } from "./hyperliquid/feed";

export const session = createSession(createHyperLiquidFeed(TESTNET_WS));

session.selectMarket(DEFAULT_MARKET);

// Without this, every hot reload in dev would leave the previous socket running.
import.meta.hot?.dispose(() => session.close());
