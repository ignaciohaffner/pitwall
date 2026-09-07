import { describe, it, expect } from "vitest";

import { parseTimeMs, formatDelta } from "./timeUtils";

describe("parseTimeMs", () => {
	it("parses m:ss.mmm lap times", () => {
		expect(parseTimeMs("1:23.456")).toBe(83456);
		expect(parseTimeMs("0:59.999")).toBe(59999);
	});

	it("parses bare seconds (sector times)", () => {
		expect(parseTimeMs("27.536")).toBe(27536);
	});

	it("returns Infinity for an empty string", () => {
		expect(parseTimeMs("")).toBe(Infinity);
	});
});

describe("formatDelta", () => {
	it("signs and fixes to 3 decimals", () => {
		expect(formatDelta(1234)).toBe("+1.234");
		expect(formatDelta(-455)).toBe("-0.455");
	});

	it("is empty for zero / non-finite", () => {
		expect(formatDelta(0)).toBe("");
		expect(formatDelta(Infinity)).toBe("");
	});
});
