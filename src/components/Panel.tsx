import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelProps = {
	title: string;
	children: ReactNode;
	className?: string;
	/** Dims the content while the socket is down: the last data stays visible but frozen. */
	stale?: boolean;
};

export function Panel({
	title,
	children,
	className,
	stale = false,
}: PanelProps) {
	return (
		<section
			className={cn(
				"flex min-h-0 flex-col rounded-md border bg-card",
				className,
			)}
			aria-label={title}
		>
			<h2 className="border-b px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
				{title}
			</h2>
			<div
				className={cn(
					"min-h-0 flex-1 transition-opacity",
					stale && "opacity-40",
				)}
				title={stale ? "Connection lost: not updating" : undefined}
			>
				{children}
			</div>
		</section>
	);
}

/** Fixed-height placeholder rows so nothing jumps when data arrives. */
export function RowSkeletons({ rows }: { rows: number }) {
	return (
		<div
			className="flex flex-col gap-1 p-3"
			role="status"
			aria-busy="true"
			aria-label="Loading"
		>
			{Array.from({ length: rows }, (_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: Expected key by index
				<div key={i} className="h-5 animate-pulse rounded-sm bg-muted" />
			))}
		</div>
	);
}
