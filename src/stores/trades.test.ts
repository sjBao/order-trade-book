import { describe, expect, it } from "vitest";
import type { Trade } from "@/domain/types";
import { mergeTrades, TAPE_LENGTH } from "./trades";

const trade = (id: number, time = id): Trade => ({
	id,
	time,
	coin: "BTC",
	side: "buy",
	px: 100,
	pxText: "100",
	sz: 1,
});

const ids = (tape: Trade[]) => tape.map((t) => t.id);

describe("mergeTrades", () => {
	it("puts the newest trade first", () => {
		expect(ids(mergeTrades(null, [trade(1), trade(3), trade(2)]))).toEqual([
			3, 2, 1,
		]);
	});

	it("ignores trades already on the tape, since a resubscribe resends recent ones", () => {
		const tape = mergeTrades(null, [trade(1), trade(2)]);
		expect(ids(mergeTrades(tape, [trade(2), trade(3)]))).toEqual([3, 2, 1]);
	});

	it("returns the same array when nothing is new, so React can skip the render", () => {
		const tape = mergeTrades(null, [trade(1)]);
		expect(mergeTrades(tape, [trade(1)])).toBe(tape);
	});

	it("keeps only the newest TAPE_LENGTH trades", () => {
		const batch = Array.from({ length: TAPE_LENGTH + 10 }, (_, i) => trade(i));
		const tape = mergeTrades(null, batch);
		expect(tape).toHaveLength(TAPE_LENGTH);
		expect(tape[0].id).toBe(TAPE_LENGTH + 9);
	});
});
