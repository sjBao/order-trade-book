import type { MarketFeed } from "@/domain/feed";
import type { Status } from "@/domain/types";
import { createWsConnection } from "./connection";

export function createHyperLiquidFeed(wsUrl: string): MarketFeed {
	const lastStatus: Status | null = null;
	const listeners = new Set<(message: Status) => void>();
	const _connection = createWsConnection(wsUrl, {
		onMessage(message) {
			console.log("**** message: ", { message });
		},
		onStatus(status) {
			listeners.forEach((listener) => listener(status));
		},
	});

	return {
		onStatus(listener) {
			listeners.add(listener);
			if (lastStatus) listener(lastStatus);
			return () => {
				listeners.delete(listener);
			};
		},
	};
}
