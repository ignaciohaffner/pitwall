import { describe, it, expect } from "vitest";

import { parseSignalrLine, projectMessage } from "./replayParse";

describe("parseSignalrLine", () => {
	it("reads the initial dump from an {I,R} line", () => {
		const line = JSON.stringify({ I: "0", R: { DriverList: { "1": { Tla: "VER" } } } });
		expect(parseSignalrLine(line)).toEqual({
			initial: { DriverList: { "1": { Tla: "VER" } } },
			messages: [],
		});
	});

	it("reads feed messages from an {M:[{A:[topic,data,utc]}]} line", () => {
		const line = JSON.stringify({
			M: [
				{ H: "Streaming", M: "feed", A: ["TrackStatus", { Status: "1" }, "2026-05-24T20:00:00.000Z"] },
				{ H: "Streaming", M: "feed", A: ["LapCount", { CurrentLap: 3 }, "2026-05-24T20:00:01.000Z"] },
			],
		});
		const parsed = parseSignalrLine(line)!;
		expect(parsed.messages).toHaveLength(2);
		expect(parsed.messages[0]).toMatchObject({ topic: "TrackStatus", data: { Status: "1" } });
		expect(parsed.messages[0].ts).toBe(Date.parse("2026-05-24T20:00:00.000Z"));
	});

	it("returns null for blank lines and non-JSON", () => {
		expect(parseSignalrLine("")).toBeNull();
		expect(parseSignalrLine("   ")).toBeNull();
		expect(parseSignalrLine("{not json")).toBeNull();
	});

	it("returns an empty message list for keepalive frames", () => {
		expect(parseSignalrLine("{}")).toEqual({ messages: [] });
		expect(parseSignalrLine(JSON.stringify({ C: "cursor" }))).toEqual({ messages: [] });
	});

	it("skips malformed A tuples", () => {
		const line = JSON.stringify({ M: [{ A: ["OnlyTopic"] }, { A: ["Good", { x: 1 }, "2026-01-01T00:00:00Z"] }] });
		expect(parseSignalrLine(line)!.messages).toHaveLength(1);
	});

	it("marks missing timestamps as NaN", () => {
		const line = JSON.stringify({ M: [{ A: ["TrackStatus", { Status: "1" }] }] });
		expect(parseSignalrLine(line)!.messages[0].ts).toBeNaN();
	});
});

describe("projectMessage", () => {
	it("keeps state topics", () => {
		expect(projectMessage("TimingData", { Lines: {} })).toEqual({ key: "TimingData", data: { Lines: {} } });
	});

	it("keeps the compressed telemetry topics as passthrough", () => {
		expect(projectMessage("CarData.z", "blob")).toEqual({ key: "CarData.z", data: "blob" });
		expect(projectMessage("Position.z", "blob")).toEqual({ key: "Position.z", data: "blob" });
	});

	it("drops everything else (TimingDataF1, DriverTracker, …)", () => {
		expect(projectMessage("TimingDataF1", {})).toBeNull();
		expect(projectMessage("DriverTracker", {})).toBeNull();
		expect(projectMessage("WeatherDataSeries", {})).toBeNull();
	});
});
