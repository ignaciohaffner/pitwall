import { describe, expect, it } from "vitest";

import { initialNewKeys, trackNewKeys } from "./newKeys";

describe("trackNewKeys", () => {
	it("takes the first non-empty list as the baseline: nothing there on load is new", () => {
		const s = trackNewKeys(trackNewKeys(initialNewKeys(), []), ["a", "b"]);
		expect(Array.from(s.fresh)).toEqual([]);
	});

	it("marks keys that arrive later, and keeps them marked", () => {
		const base = trackNewKeys(initialNewKeys(), ["a"]);
		const one = trackNewKeys(base, ["b", "a"]);
		const two = trackNewKeys(one, ["c", "b", "a"]);
		expect(Array.from(two.fresh).sort()).toEqual(["b", "c"]);
	});

	it("returns the same state when nothing changed", () => {
		const base = trackNewKeys(initialNewKeys(), ["a"]);
		expect(trackNewKeys(base, ["a"])).toBe(base);
		const empty = initialNewKeys();
		expect(trackNewKeys(empty, [])).toBe(empty);
	});

	it("starts over when the list empties (a new session)", () => {
		const base = trackNewKeys(trackNewKeys(initialNewKeys(), ["a"]), ["b", "a"]);
		const cleared = trackNewKeys(base, []);
		const next = trackNewKeys(cleared, ["x", "y"]);
		expect(Array.from(next.fresh)).toEqual([]);
	});
});
