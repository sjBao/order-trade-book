import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import type { Status } from "@/domain/types";
import { createHyperLiquidFeed } from "@/hyperliquid/feed";
import { TESTNET_WS } from "@/hyperliquid/wire";
import { cn } from "@/lib/utils";
import { bookStore } from "@/stores/book";
import { statusStore, useConnectionStatus } from "@/stores/status";

// Record<Status, …>: adding a status to the type is a compile error here until it has a label.
const LABEL: Record<Status, string> = {
	connecting: "Connecting…",
	open: "Live",
	reconnecting: "Reconnecting…",
	offline: "Offline",
	closed: "Disconnected",
};
const VARIANT: Record<Status, ComponentProps<typeof Badge>["variant"]> = {
	connecting: "outline",
	open: "secondary",
	reconnecting: "outline",
	offline: "destructive",
	closed: "destructive",
};
const DOT: Record<Status, string> = {
	connecting: "bg-muted-foreground animate-pulse",
	open: "bg-bid",
	reconnecting: "bg-muted-foreground animate-pulse",
	offline: "bg-ask",
	closed: "bg-ask",
};

const feed = createHyperLiquidFeed(TESTNET_WS);
feed.onStatus((status) => statusStore.set(status));
feed.onBook("BTC", (book) => bookStore.set(book));

export function ConnectionBadge() {
	// null only until the first animation frame; the socket starts connecting on load.
	const status = useConnectionStatus() ?? "connecting";

	return (
		<Badge variant={VARIANT[status]} className="font-mono" aria-live="polite">
			<span className={cn("size-2 rounded-full", DOT[status])} />
			{LABEL[status]}
		</Badge>
	);
}
