import { AppLayout } from "./components/AppLayout";
import { ConnectionBadge } from "./components/ConnectionBadge";

function App() {
	return (
		<div className="flex h-dvh flex-col gap-3 bg-background p-3 text-foreground">
			<header className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<h1 className="text-sm font-semibold">Primex trade book</h1>
					<div className="border border-white border-solid">
						Market selector
					</div>
				</div>
				<ConnectionBadge />
			</header>
			<AppLayout />
		</div>
	);
}

export default App;
