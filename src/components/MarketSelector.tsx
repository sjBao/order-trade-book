import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MARKETS } from "@/domain/market";
import { session } from "@/session";
import { useSelectedCoin } from "@/stores/selectedCoinStore";

export function MarketSelector() {
	const selected = useSelectedCoin();

	return (
		<ToggleGroup
			type="single"
			variant="outline"
			value={selected ?? ""}
			onValueChange={(coin) => {
				if (coin) session.selectMarket(coin); // "" is a deselect: a market is always selected
			}}
			aria-label="Market"
		>
			{MARKETS.map((coin) => (
				<ToggleGroupItem key={coin} value={coin} className="font-mono text-xs">
					{coin}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}
