import { useBook } from "@/stores/book";
import { useIsStale } from "@/stores/status";
import { Panel, RowSkeletons } from "../Panel";

const ROWS_PER_SIDE = 11;

export function OrderBook() {
	const stale = useIsStale();
	const book = useBook();

	console.log("****** hello book", { book });

	return (
		<Panel
			title="Order book"
			stale={stale}
			className="[contain:layout_paint] self-start"
		>
			<RowSkeletons rows={ROWS_PER_SIDE * 2 + 2} />
		</Panel>
	);
}
