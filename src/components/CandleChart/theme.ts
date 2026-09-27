import { ColorType } from "lightweight-charts";

// lightweight-charts converts colours via getComputedStyle and only accepts rgb()/rgba() back.
// shadcn's theme uses oklch(), which modern browsers return unchanged, so the chart would throw
// "Failed to parse color". Paint the colour onto a 1x1 canvas and read the pixel back as rgb.
let pixel: CanvasRenderingContext2D | null = null;

function cssVarToRgb(name: string): string {
	pixel ??= document
		.createElement("canvas")
		.getContext("2d", { willReadFrequently: true });
	if (!pixel) return "rgb(128, 128, 128)";
	pixel.clearRect(0, 0, 1, 1);
	pixel.fillStyle = cssVar(name);
	pixel.fillRect(0, 0, 1, 1);
	const [r, g, b, a] = pixel.getImageData(0, 0, 1, 1).data;
	return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
}

function cssVar(name: string): string {
	return getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim();
}

export function chartOptions() {
	return {
		layout: {
			background: { type: ColorType.Solid, color: cssVarToRgb("--card") },
			textColor: cssVarToRgb("--muted-foreground"),
			fontFamily: cssVar("--font-mono") || "ui-monospace, monospace",
			fontSize: 11,
		},
		grid: {
			vertLines: { visible: false },
			horzLines: { color: cssVarToRgb("--border") },
		},
		rightPriceScale: { borderColor: cssVarToRgb("--border") },
		timeScale: {
			borderColor: cssVarToRgb("--border"),
			timeVisible: true,
			secondsVisible: false,
		},
	};
}

export function seriesOptions() {
	return {
		upColor: cssVarToRgb("--bid"),
		wickUpColor: cssVarToRgb("--bid"),
		downColor: cssVarToRgb("--ask"),
		wickDownColor: cssVarToRgb("--ask"),
		borderVisible: false,
	};
}
