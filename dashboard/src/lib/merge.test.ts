import { describe, it, expect } from "vitest";

import { merge } from "./merge";

describe("merge", () => {
	it("deep-merges plain objects", () => {
		expect(merge({ a: 1, b: { c: 2, d: 3 } }, { b: { c: 20 }, e: 4 })).toEqual({
			a: 1,
			b: { c: 20, d: 3 },
			e: 4,
		});
	});

	it("replaces primitives and arrays wholesale", () => {
		expect(merge({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
		expect(merge({ list: [1, 2, 3] }, { list: [9] })).toEqual({ list: [9] });
	});

	it("patches an array by index when the update is an index-keyed object", () => {
		// this is how the F1 feed sends array deltas (e.g. RaceControlMessages)
		expect(merge([{ x: 1 }, { x: 2 }], { "1": { x: 20 } })).toEqual([{ x: 1 }, { x: 20 }]);
	});

	it("appends to an array when the index is past the end", () => {
		expect(merge(["a"], { "1": "b", "2": "c" })).toEqual(["a", "b", "c"]);
	});

	it("does not mutate its inputs", () => {
		const base = { a: { b: 1 } };
		const update = { a: { c: 2 } };
		merge(base, update);
		expect(base).toEqual({ a: { b: 1 } });
		expect(update).toEqual({ a: { c: 2 } });
	});

	it("treats a missing base key as null before merging", () => {
		expect(merge({}, { a: { b: 1 } })).toEqual({ a: { b: 1 } });
	});

	it("overwrites when types mismatch (object over primitive)", () => {
		expect(merge({ a: 5 }, { a: { b: 1 } })).toEqual({ a: { b: 1 } });
	});

	it("folds a realistic TimingData delta onto driver lines", () => {
		const state = {
			TimingData: { Lines: { "1": { Position: "1", GapToLeader: "" }, "44": { Position: "2" } } },
		};
		const update = { TimingData: { Lines: { "44": { GapToLeader: "+1.234" } } } };
		expect(merge(state, update)).toEqual({
			TimingData: {
				Lines: {
					"1": { Position: "1", GapToLeader: "" },
					"44": { Position: "2", GapToLeader: "+1.234" },
				},
			},
		});
	});
});
