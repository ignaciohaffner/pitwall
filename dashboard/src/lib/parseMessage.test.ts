import { describe, it, expect } from "vitest";

import { parseMessage } from "./parseMessage";

describe("parseMessage", () => {
	it("renames CarData.z / Position.z to CarDataZ / PositionZ", () => {
		const out = parseMessage<Record<string, unknown>>(
			JSON.stringify({ "CarData.z": "abc", "Position.z": "def", TimingData: { Lines: {} } }),
		);
		expect(out).toEqual({ CarDataZ: "abc", PositionZ: "def", TimingData: { Lines: {} } });
		expect("CarData.z" in out).toBe(false);
	});

	it("leaves an already-normalised payload alone", () => {
		const out = parseMessage<Record<string, unknown>>(JSON.stringify({ CarDataZ: "abc" }));
		expect(out).toEqual({ CarDataZ: "abc" });
	});

	it("keeps an existing CarDataZ over the dotted key", () => {
		const out = parseMessage<Record<string, unknown>>(JSON.stringify({ CarDataZ: "keep", "CarData.z": "drop" }));
		expect(out.CarDataZ).toBe("keep");
		expect("CarData.z" in out).toBe(false);
	});

	it("passes through unrelated messages untouched", () => {
		const out = parseMessage(JSON.stringify({ SessionInfo: { Name: "Race" } }));
		expect(out).toEqual({ SessionInfo: { Name: "Race" } });
	});
});
