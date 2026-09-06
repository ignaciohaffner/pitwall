import { describe, it, expect } from "vitest";

import { sortPos, sortUtc, sortQuali } from "./sorting";

describe("sortPos", () => {
	it("orders by numeric Position string", () => {
		const lines = [{ Position: "3" }, { Position: "1" }, { Position: "10" }, { Position: "2" }];
		expect(lines.sort(sortPos).map((l) => l.Position)).toEqual(["1", "2", "3", "10"]);
	});
});

describe("sortUtc", () => {
	it("orders newest first", () => {
		const rows = [{ Utc: "2026-05-24T20:00:00Z" }, { Utc: "2026-05-24T20:05:00Z" }, { Utc: "2026-05-24T19:00:00Z" }];
		expect(rows.sort(sortUtc).map((r) => r.Utc)).toEqual([
			"2026-05-24T20:05:00Z",
			"2026-05-24T20:00:00Z",
			"2026-05-24T19:00:00Z",
		]);
	});
});

describe("sortQuali", () => {
	it("orders by how many mini-sectors have been passed", () => {
		const seg = (n: number) => ({ Sectors: [{ Segments: Array.from({ length: n }, () => ({ Status: 2048 })) }] });
		const rows = [seg(1), seg(5), seg(3)];
		expect(rows.sort(sortQuali).map((r) => r.Sectors[0].Segments.length)).toEqual([5, 3, 1]);
	});
});
