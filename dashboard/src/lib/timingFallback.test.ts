import { describe, expect, it } from "vitest";

import type { SessionInfo, State } from "@/types/state.type";
import type { Round } from "@/types/schedule.type";

import { scheduleSessionFix, synthesizeTimingData } from "./timingFallback";

const driver = (nr: string, line: number) => ({ RacingNumber: nr, Line: line, Tla: `D${nr}` });
const stats = (value: string) => ({
	PersonalBestLapTime: { Value: value, Position: 0 },
	BestSectors: [],
	BestSpeeds: {},
});

// Mexico FP3 2026 as the feed sent it: drivers, best laps and stints, TimingData without lines.
const brokenFeed = {
	DriverList: { "1": driver("1", 5), "10": driver("10", 1), "27": driver("27", 2) },
	TimingStats: { Withheld: false, Lines: { "1": stats(""), "10": stats("1:20.820"), "27": stats("1:20.572") } },
	TimingAppData: {
		Lines: {
			"27": {
				RacingNumber: "27",
				Stints: [
					{ TotalLaps: 4, StartLaps: 0 },
					{ TotalLaps: 5, StartLaps: 3 },
				],
			},
		},
	},
	TimingData: { Lines: {}, Withheld: false },
} as unknown as Partial<State>;

describe("synthesizeTimingData", () => {
	it("orders drivers by best lap, the ones without one last by DriverList line", () => {
		const td = synthesizeTimingData(brokenFeed)!;
		expect(td.Synthetic).toBe(true);
		const order = Object.values(td.Lines)
			.sort((a, b) => +a.Position - +b.Position)
			.map((l) => l.RacingNumber);
		expect(order).toEqual(["27", "10", "1"]);
		expect(td.Lines["27"].BestLapTime.Value).toBe("1:20.572");
		expect(td.Lines["10"].GapToLeader).toBe("+0.248");
		expect(td.Lines["27"].GapToLeader).toBe("");
		expect(td.Lines["1"].GapToLeader).toBe("");
	});

	it("counts laps from the stints, leaving out laps the tyres had before", () => {
		const td = synthesizeTimingData(brokenFeed)!;
		expect(td.Lines["27"].NumberOfLaps).toBe(6);
		expect(td.Lines["1"].NumberOfLaps).toBe(0);
	});

	it("keeps drivers who haven't left the garage in the pit", () => {
		const td = synthesizeTimingData(brokenFeed)!;
		expect(td.Lines["1"].InPit).toBe(true);
		expect(td.Lines["27"].InPit).toBe(false);
	});

	it("leaves real TimingData alone", () => {
		const ok = { ...brokenFeed, TimingData: { Lines: { "1": {} }, Withheld: false } } as unknown as Partial<State>;
		expect(synthesizeTimingData(ok)).toBeNull();
	});

	it("needs a driver list", () => {
		expect(synthesizeTimingData({ ...brokenFeed, DriverList: undefined })).toBeNull();
	});
});

const raceInfo = {
	Meeting: { Country: { Name: "Mexico" } },
	Type: "Race",
	Name: "Race",
	StartDate: "2026-11-01T14:00:00",
	GmtOffset: "-06:00:00",
	Path: "2026/2026-11-01_Mexico_City_Grand_Prix/2026-11-01_Race/",
} as unknown as SessionInfo;

const mexico: Round = {
	name: "GRAN PREMIO DE LA CIUDAD DE MÉXICO 2026",
	countryName: "Mexico",
	countryKey: null,
	start: "2026-10-30T18:30:00Z",
	end: "2026-11-01T22:00:00Z",
	over: false,
	sessions: [
		{ kind: "Practice 3", start: "2026-10-31T17:30:00Z", end: "2026-10-31T18:30:00Z" },
		{ kind: "Qualifying", start: "2026-10-31T21:00:00Z", end: "2026-10-31T22:00:00Z" },
		{ kind: "Race", start: "2026-11-01T20:00:00Z", end: "2026-11-01T22:00:00Z" },
	],
};

describe("scheduleSessionFix", () => {
	it("relabels the feed's Race as the Practice 3 on track", () => {
		const fixed = scheduleSessionFix(raceInfo, mexico, Date.parse("2026-10-31T17:40:00Z"));
		expect(fixed).toMatchObject({ Type: "Practice", Name: "Practice 3", Path: raceInfo.Path });
	});

	it("keeps a SessionInfo that matches the session on track", () => {
		expect(scheduleSessionFix(raceInfo, mexico, Date.parse("2026-11-01T20:30:00Z"))).toBeNull();
	});

	it("does nothing between sessions or for another meeting", () => {
		expect(scheduleSessionFix(raceInfo, mexico, Date.parse("2026-10-31T19:30:00Z"))).toBeNull();
		const brazil = { ...raceInfo, Meeting: { Country: { Name: "Brazil" } } } as unknown as SessionInfo;
		expect(scheduleSessionFix(brazil, mexico, Date.parse("2026-10-31T17:40:00Z"))).toBeNull();
		expect(scheduleSessionFix(raceInfo, null, Date.parse("2026-10-31T17:40:00Z"))).toBeNull();
	});

	it("maps Qualifying from the schedule", () => {
		expect(scheduleSessionFix(raceInfo, mexico, Date.parse("2026-10-31T21:10:00Z"))).toMatchObject({
			Type: "Qualifying",
			Name: "Qualifying",
		});
	});
});
