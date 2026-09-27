import { useBook } from "@/stores/book";
import { useIsStale } from "@/stores/status";
import { Panel, RowSkeletons } from "../Panel";
import { BookTable } from "./BookTable";

const ROWS_PER_SIDE = 11;

export function OrderBook() {
	const stale = useIsStale();
	const book = useBook();

	return (
		<Panel
			title="Order book"
			stale={stale}
			className="[contain:layout_paint] self-start"
		>
			{book ? (
				<BookTable book={book} />
			) : (
				<RowSkeletons rows={ROWS_PER_SIDE * 2 + 2} />
			)}
		</Panel>
	);
}
