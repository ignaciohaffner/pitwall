// Fallbacks for a broken F1 feed. At Mexico FP3 2026 the free feed sent TimingData with no
// Lines at all and labelled the session as the next day's Race, while TimingStats,
// TimingAppData and DriverList kept flowing. These rebuild what the tables need from them.
import type { SessionInfo, State, TimingData, TimingDataDriver } from "@/types/state.type";
import type { Round } from "@/types/schedule.type";

import { parseTimeMs } from "@/lib/timeUtils";

const emptySector = () => ({
	Stopped: false,
	Value: "",
	Status: 0,
	OverallFastest: false,
	PersonalFastest: false,
	Segments: [],
});

const emptyValue = () => ({ Value: "", Status: 0, OverallFastest: false, PersonalFastest: false });

/**
 * TimingData rebuilt from the other topics when the feed sends it without any driver:
 * one line per driver, ordered by best lap (drivers without one by their DriverList line).
 * Gaps and sectors in progress are unknown and left empty; a driver without a stint yet hasn't
 * left the garage and is shown in the pit. Returns null when
 * TimingData has lines or there are no drivers to build them from.
 */
export function synthesizeTimingData(state: Partial<State>): TimingData | null {
	const timing = state.TimingData;
	if (timing && Object.keys(timing.Lines ?? {}).length > 0) return null;
	const drivers = state.DriverList;
	if (!drivers) return null;

	const numbers = Object.keys(drivers).filter((nr) => drivers[nr]?.RacingNumber);
	if (numbers.length === 0) return null;

	const best = (nr: string) => state.TimingStats?.Lines?.[nr]?.PersonalBestLapTime;
	const laps = (nr: string) =>
		(state.TimingAppData?.Lines?.[nr]?.Stints ?? []).reduce(
			(sum, stint) => sum + Math.max(0, (stint.TotalLaps ?? 0) - (stint.StartLaps ?? 0)),
			0,
		);

	const ordered = [...numbers].sort((a, b) => {
		const diff = parseTimeMs(best(a)?.Value ?? "") - parseTimeMs(best(b)?.Value ?? "");
		if (diff !== 0 && !Number.isNaN(diff)) return diff;
		return (drivers[a].Line ?? 99) - (drivers[b].Line ?? 99);
	});
	const fastestMs = parseTimeMs(best(ordered[0])?.Value ?? "");

	const lines: Record<string, TimingDataDriver> = {};
	ordered.forEach((nr, index) => {
		const bestValue = best(nr)?.Value ?? "";
		const ms = parseTimeMs(bestValue);
		const gap =
			index > 0 && Number.isFinite(ms) && Number.isFinite(fastestMs) ? `+${((ms - fastestMs) / 1000).toFixed(3)}` : "";
		lines[nr] = {
			RacingNumber: nr,
			Line: index + 1,
			Position: String(index + 1),
			ShowPosition: true,
			GapToLeader: gap,
			TimeDiffToFastest: gap,
			Retired: false,
			InPit: (state.TimingAppData?.Lines?.[nr]?.Stints ?? []).length === 0,
			PitOut: false,
			Stopped: false,
			Status: 0,
			Sectors: [emptySector(), emptySector(), emptySector()],
			Speeds: { I1: emptyValue(), I2: emptyValue(), FL: emptyValue(), ST: emptyValue() },
			BestLapTime: { Value: bestValue, Position: index + 1 },
			LastLapTime: emptyValue(),
			NumberOfLaps: laps(nr),
		} as TimingDataDriver;
	});

	return { ...(timing ?? {}), Lines: lines, Withheld: timing?.Withheld ?? false, Synthetic: true };
}

const BEFORE_START_MS = 15 * 60_000;
const AFTER_END_MS = 30 * 60_000;
const SAME_SESSION_MS = 60 * 60_000;

/** "2026-11-01T14:00:00" at GMT offset "-06:00:00" as epoch ms. */
const sessionStartMs = (info: SessionInfo): number => {
	const [h = "0", m = "0"] = (info.GmtOffset ?? "00:00:00").replace("-", "").split(":");
	const sign = info.GmtOffset?.startsWith("-") ? -1 : 1;
	const offsetMs = sign * (parseInt(h) * 60 + parseInt(m)) * 60_000;
	return Date.parse(`${info.StartDate}Z`) - offsetMs;
};

const typeOf = (kind: string): string =>
	kind.startsWith("Practice") ? "Practice" : kind.includes("Qualifying") ? "Qualifying" : "Race";

/**
 * SessionInfo corrected from the schedule when the feed names another session of the same
 * meeting than the one on track now (the schedule's session running at `nowMs` starts more
 * than an hour away from the feed's). Returns null when the feed agrees or can't be checked.
 */
export function scheduleSessionFix(
	info: SessionInfo | undefined,
	round: Round | null,
	nowMs: number,
): SessionInfo | null {
	if (!info || !round) return null;
	if (round.countryName.toLowerCase() !== info.Meeting?.Country?.Name?.toLowerCase()) return null;

	const onTrack = round.sessions.find(
		(s) => Date.parse(s.start) - BEFORE_START_MS <= nowMs && nowMs <= Date.parse(s.end) + AFTER_END_MS,
	);
	if (!onTrack) return null;

	const feedStart = sessionStartMs(info);
	if (Number.isFinite(feedStart) && Math.abs(feedStart - Date.parse(onTrack.start)) <= SAME_SESSION_MS) return null;

	const type = typeOf(onTrack.kind);
	if (info.Type === type && info.Name === onTrack.kind) return null;
	return { ...info, Type: type, Name: onTrack.kind };
}
