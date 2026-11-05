import { afterEach, describe, expect, it, vi } from "vitest";

import {
	applySprint,
	fetchOfficialStandings,
	findRound,
	officialStandings,
	predictStandings,
	RACE_POINTS,
	type BaseStandings,
} from "./standings";

const base = (): BaseStandings => ({
	drivers: [
		{ number: "12", code: "ANT", points: 100, position: 1, constructorId: "mercedes" },
		{ number: "63", code: "RUS", points: 90, position: 2, constructorId: "mercedes" },
		{ number: "44", code: "HAM", points: 80, position: 3, constructorId: "ferrari" },
	],
	teams: [
		{ constructorId: "mercedes", name: "Mercedes", points: 190, position: 1 },
		{ constructorId: "ferrari", name: "Ferrari", points: 80, position: 2 },
	],
});

const driverList = {
	"12": { Tla: "ANT", TeamName: "Mercedes" },
	"63": { Tla: "RUS", TeamName: "Mercedes" },
	"44": { Tla: "HAM", TeamName: "Ferrari" },
	"7": { Tla: "NEW", TeamName: "Ferrari" },
};

const line = (nr: string, pos: number, extra = {}) => ({
	RacingNumber: nr,
	Position: String(pos),
	Retired: false,
	Stopped: false,
	...extra,
});

describe("predictStandings", () => {
	it("adds points for the running order and re-ranks", () => {
		const lines = { "44": line("44", 1), "63": line("63", 2), "12": line("12", 3), "7": line("7", 4) };
		const p = predictStandings(base(), lines, driverList, RACE_POINTS);

		expect(p.Drivers["44"]).toMatchObject({ CurrentPoints: 80, PredictedPoints: 105, CurrentPosition: 3 });
		expect(p.Drivers["63"]).toMatchObject({ PredictedPoints: 108, PredictedPosition: 2 });
		expect(p.Drivers["12"]).toMatchObject({ PredictedPoints: 115, PredictedPosition: 1 });
		expect(p.Drivers["44"].PredictedPosition).toBe(3);
		// unknown driver starts from zero, team inferred from live team name
		expect(p.Drivers["7"]).toMatchObject({ CurrentPoints: 0, PredictedPoints: 12, CurrentPosition: 4 });

		expect(p.Teams["Mercedes"]).toMatchObject({ PredictedPoints: 190 + 18 + 15 });
		expect(p.Teams["Ferrari"]).toMatchObject({ PredictedPoints: 80 + 25 + 12 });
	});

	it("gives retired and stopped cars nothing", () => {
		const lines = {
			"44": line("44", 1, { Retired: true }),
			"63": line("63", 2, { Stopped: true }),
			"12": line("12", 3),
		};
		const p = predictStandings(base(), lines, driverList, RACE_POINTS);
		expect(p.Drivers["44"].PredictedPoints).toBe(80);
		expect(p.Drivers["63"].PredictedPoints).toBe(90);
		expect(p.Drivers["12"].PredictedPoints).toBe(115);
	});

	it("keeps pre-race order on ties", () => {
		const lines = { "63": line("63", 1), "12": line("12", 5), "44": line("44", 11) };
		const b = base();
		b.drivers[1].points = 75; // RUS 75 + 25 = 100, ANT 100 + 10 = 110
		b.drivers[0].points = 90; // ANT 90 + 10 = 100 -> tie with RUS, ANT was ahead
		const p = predictStandings(b, lines, driverList, RACE_POINTS);
		expect(p.Drivers["12"].PredictedPosition).toBe(1);
		expect(p.Drivers["63"].PredictedPosition).toBe(2);
	});
});

describe("predictStandings roster", () => {
	it("ignores feed flags and keeps absent drivers in the championship", () => {
		const b = base();
		b.drivers.push({ number: "22", code: "TSU", familyName: "Tsunoda", points: 1, position: 4 });
		const list = { ...driverList, _kf: true } as unknown as typeof driverList;
		const p = predictStandings(b, { "12": line("12", 1) }, list, RACE_POINTS);

		expect(p.Drivers["_kf"]).toBeUndefined();
		expect(p.Drivers["22"]).toMatchObject({ Tla: "TSU", CurrentPosition: 4, PredictedPoints: 1, PredictedPosition: 4 });
		// NEW (0 pts) stays behind TSU instead of jumping up a place
		expect(p.Drivers["7"].PredictedPosition).toBe(5);
	});
});

describe("findRound", () => {
	const races = [
		{ round: "14", date: "2026-09-13" },
		{ round: "15", date: "2026-09-26" },
	];

	it("matches any session of the race weekend", () => {
		expect(findRound(races, "2026-09-24T12:30:00")?.round).toBe("15");
		expect(findRound(races, "2026-09-26T15:00:00")?.round).toBe("15");
		expect(findRound(races, "2026-09-20T15:00:00")).toBeNull();
	});
});

describe("applySprint", () => {
	it("folds sprint points into the pre-race base", () => {
		const b = base();
		applySprint(b, [
			{
				number: "44",
				points: "8",
				Driver: { permanentNumber: "44", code: "HAM" },
				Constructor: { constructorId: "ferrari", name: "Ferrari" },
			},
			{
				number: "12",
				points: "7",
				Driver: { permanentNumber: "12", code: "ANT" },
				Constructor: { constructorId: "mercedes", name: "Mercedes" },
			},
		]);
		expect(b.drivers.find((d) => d.code === "HAM")?.points).toBe(88);
		expect(b.teams.find((t) => t.constructorId === "mercedes")?.points).toBe(197);
		expect(b.drivers.find((d) => d.code === "HAM")?.position).toBe(3);
	});
});

describe("predictStandings constructors", () => {
	it("credits a driver's points to the team they race for today, not their last team in the standings", () => {
		// 2026 Bahrain GP: Lawson races for Racing Bulls; jolpica lists him under rb and red_bull.
		const base: BaseStandings = {
			drivers: [
				{ number: "3", code: "VER", points: 163, position: 1, constructorId: "red_bull", constructorIds: ["red_bull"] },
				{ number: "6", code: "HAD", points: 86, position: 2, constructorId: "red_bull", constructorIds: ["red_bull"] },
				{
					number: "30",
					code: "LAW",
					points: 59,
					position: 3,
					constructorId: "red_bull",
					constructorIds: ["rb", "red_bull"],
				},
				{ number: "41", code: "LIN", points: 37, position: 4, constructorId: "rb", constructorIds: ["rb"] },
			],
			teams: [
				{ constructorId: "red_bull", name: "Red Bull", points: 263, position: 1 },
				{ constructorId: "rb", name: "RB F1 Team", points: 83, position: 2 },
			],
		};
		const list = {
			"3": { Tla: "VER", TeamName: "Red Bull Racing" },
			"6": { Tla: "HAD", TeamName: "Red Bull Racing" },
			"30": { Tla: "LAW", TeamName: "Racing Bulls" },
			"41": { Tla: "LIN", TeamName: "Racing Bulls" },
		};
		const result = predictStandings(
			base,
			{ "3": line("3", 1), "6": line("6", 7), "30": line("30", 8), "41": line("41", 10) },
			list,
			RACE_POINTS,
		);
		expect(result.Teams["Red Bull Racing"]?.PredictedPoints).toBe(263 + 25 + 6);
		expect(result.Teams["Racing Bulls"]?.PredictedPoints).toBe(83 + 4 + 1);
	});
});

describe("officialStandings", () => {
	const after = (): BaseStandings => ({
		drivers: [
			{ number: "44", code: "HAM", familyName: "Hamilton", points: 105, position: 1, constructorId: "ferrari" },
			{ number: "12", code: "ANT", familyName: "Antonelli", points: 105, position: 2, constructorId: "mercedes" },
			{ number: "63", code: "RUS", familyName: "Russell", points: 90, position: 3, constructorId: "mercedes" },
		],
		teams: [
			{ constructorId: "ferrari", name: "Ferrari", points: 105, position: 1 },
			{ constructorId: "mercedes", name: "Mercedes", points: 195, position: 2 },
		],
	});

	it("takes points and positions from the published standings, ties included", () => {
		const o = officialStandings(base(), after(), driverList);

		expect(o.Drivers["44"]).toMatchObject({
			CurrentPoints: 80,
			CurrentPosition: 3,
			PredictedPoints: 105,
			PredictedPosition: 1,
		});
		expect(o.Drivers["12"]).toMatchObject({ CurrentPoints: 100, PredictedPoints: 105, PredictedPosition: 2 });
		expect(o.Teams["Ferrari"]).toMatchObject({ CurrentPoints: 80, PredictedPoints: 105, PredictedPosition: 1 });
	});

	it("finds a driver by code when the race number isn't their permanent one", () => {
		const list = { "1": { Tla: "HAM", TeamName: "Ferrari" } };
		const o = officialStandings(base(), after(), list);

		expect(o.Drivers["1"]).toMatchObject({ CurrentPoints: 80, PredictedPoints: 105 });
		expect(o.Drivers["44"]).toBeUndefined();
	});

	it("labels published drivers who aren't in this session's DriverList", () => {
		const list = { "44": { Tla: "HAM", TeamName: "Ferrari" } };
		const o = officialStandings(base(), after(), list);

		expect(o.Drivers["63"]).toMatchObject({ Tla: "RUS", FamilyName: "Russell", PredictedPosition: 3 });
	});

	it("keeps a driver with no published standing on their earlier points, below the published ones", () => {
		const o = officialStandings(base(), after(), driverList);

		expect(o.Drivers["7"]).toMatchObject({ CurrentPoints: 0, PredictedPoints: 0, PredictedPosition: 4 });
	});

	it("uses the live team name for a constructor", () => {
		const list = { "44": { Tla: "HAM", TeamName: "Scuderia Ferrari" } };
		const o = officialStandings(base(), after(), list);

		expect(o.Teams["Scuderia Ferrari"]).toMatchObject({ CurrentPoints: 80, PredictedPoints: 105 });
	});
});

describe("fetchOfficialStandings", () => {
	const standingsBody = (round: string, drivers: unknown[]) => ({
		MRData: {
			StandingsTable: {
				StandingsLists: drivers.length ? [{ round, DriverStandings: drivers, ConstructorStandings: [] }] : [],
			},
		},
	});
	const jolpicaDriver = {
		position: "1",
		points: "105",
		Driver: { permanentNumber: "44", code: "HAM", familyName: "Hamilton" },
		Constructors: [{ constructorId: "ferrari" }],
	};
	const respondWith = (body: unknown) =>
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response(JSON.stringify(body))),
		);
	const withRound = (): BaseStandings => ({ ...base(), currentRound: 19 });

	afterEach(() => vi.unstubAllGlobals());

	it("returns this round's standings once they're published", async () => {
		respondWith(standingsBody("19", [jolpicaDriver]));

		const result = await fetchOfficialStandings(2026, withRound(), false);

		expect(result?.drivers[0]).toMatchObject({ code: "HAM", points: 105 });
	});

	it("returns null while this round isn't published", async () => {
		respondWith(standingsBody("19", []));

		expect(await fetchOfficialStandings(2026, withRound(), false)).toBeNull();
	});

	it("returns null if an earlier round comes back", async () => {
		respondWith(standingsBody("18", [jolpicaDriver]));

		expect(await fetchOfficialStandings(2026, withRound(), false)).toBeNull();
	});

	it("adds a sprint's published results to the standings before it, leaving those untouched", async () => {
		respondWith({
			MRData: {
				RaceTable: {
					Races: [
						{
							SprintResults: [
								{
									number: "44",
									points: "8",
									Driver: { permanentNumber: "44", code: "HAM" },
									Constructor: { constructorId: "ferrari", name: "Ferrari" },
								},
							],
						},
					],
				},
			},
		});
		const before = withRound();

		const result = await fetchOfficialStandings(2026, before, true);

		expect(result?.drivers.find((d) => d.code === "HAM")?.points).toBe(88);
		expect(before.drivers.find((d) => d.code === "HAM")?.points).toBe(80);
	});

	it("returns null while the sprint isn't published", async () => {
		respondWith({ MRData: { RaceTable: { Races: [] } } });

		expect(await fetchOfficialStandings(2026, withRound(), true)).toBeNull();
	});
});
