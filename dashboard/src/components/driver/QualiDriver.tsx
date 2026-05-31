"use client";

import clsx from "clsx";
import Link from "next/link";
import { motion } from "motion/react";

import type { Driver, Sector, TimingDataDriver, TimingStatsDriver, PersonalBestLapTime } from "@/types/state.type";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useDataStore } from "@/stores/useDataStore";
import { formatDelta, parseTimeMs } from "@/lib/timeUtils";

import DriverTag from "./DriverTag";
import DriverTire from "./DriverTire";

export const QUALI_GRID_COLS = "7ch 8ch 10ch 1fr 1fr 1fr 5ch";
export const QUALI_GRID_GAP = "2ch";

type Props = {
	position: number;
	driver: Driver;
	timingDriver: TimingDataDriver;
	timingStats: TimingStatsDriver | undefined;
	fastestSectors: (number | null)[];
};

export default function QualiDriver({ position, driver, timingDriver, timingStats }: Props) {
	const appTimingDriver = useDataStore((state) => state.state?.TimingAppData?.Lines[driver.RacingNumber]);
	const showMiniSectors = useSettingsStore((state) => state.showMiniSectors);

	const isOut = timingDriver.KnockedOut || timingDriver.Retired || timingDriver.Stopped;
	const hasFastestLap = timingStats?.PersonalBestLapTime.Position === 1;

	return (
		<motion.div
			layout="position"
			className={clsx(
				"group flex w-full items-center border-b border-zinc-900 py-0.5 pl-2 pr-1 font-mono text-base leading-none select-none",
				{
					"opacity-25": isOut,
					"bg-violet-950/60": hasFastestLap,
				},
			)}
		>
			<div
				className="grid min-w-0 flex-1 items-center"
				style={{ columnGap: QUALI_GRID_GAP, gridTemplateColumns: QUALI_GRID_COLS }}
			>
				<DriverTag short={driver.Tla} teamColor={driver.TeamColour} position={position} />

				{/* GAP to P1 best lap */}
				<span
					className={clsx("block w-full text-right tabular-nums", {
						"text-emerald-400": !timingDriver.GapToLeader || timingDriver.GapToLeader === "0.000",
						"text-zinc-300": timingDriver.GapToLeader && timingDriver.GapToLeader !== "0.000",
						"text-zinc-700": !timingDriver.GapToLeader,
					})}
				>
					{timingDriver.GapToLeader
						? timingDriver.GapToLeader === "0.000" ? "LEADER" : `+${timingDriver.GapToLeader}`
						: "---"}
				</span>

				{/* Best lap time */}
				<span
					className={clsx("block w-full text-right tabular-nums", {
						"text-violet-400": hasFastestLap,
						"text-zinc-300": !hasFastestLap && !!timingDriver.BestLapTime.Value,
						"text-zinc-700": !timingDriver.BestLapTime.Value,
					})}
				>
					{timingDriver.BestLapTime.Value || "---"}
				</span>

				{/* S1, S2, S3 — merged: best on top, current + Δ below */}
				{[0, 1, 2].map((i) => (
					<QualiSectorCell
						key={`s${i}`}
						sector={timingDriver.Sectors[i]}
						bestSector={timingStats?.BestSectors[i]}
						showMiniSectors={showMiniSectors}
					/>
				))}

				<DriverTire stints={appTimingDriver?.Stints} />
			</div>

			<Link
				href={`/dashboard/driver/${driver.RacingNumber}`}
				className="ml-2 hidden h-4 w-4 shrink-0 items-center justify-center text-zinc-800 hover:text-zinc-500 group-hover:flex"
				aria-label={`View ${driver.FullName}`}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
				</svg>
			</Link>
		</motion.div>
	);
}

type SectorCellProps = {
	sector: Sector | undefined;
	bestSector: PersonalBestLapTime | undefined;
	showMiniSectors: boolean;
};

/**
 * Line 1 (big): personal best sector — the standing reference.
 * Line 2 (small): what's happening THIS lap.
 *   • in-sector  → mini-bar blocks (live pace)
 *   • completed  → sector time + Δ vs personal best
 *   • nothing    → empty (driver between laps / no data)
 *
 * `sector.Value`        = sector timing for the CURRENT lap (non-empty while active/just finished)
 * `sector.PreviousValue`= sector from the previous lap  (don't show Δ — could be any lap)
 */
function QualiSectorCell({ sector, bestSector, showMiniSectors }: SectorCellProps) {
	if (!sector) return <span className="text-zinc-800">---</span>;

	const bestTime = bestSector?.Value ?? "";
	const curTime  = sector.Value ?? "";
	const prevTime = sector.PreviousValue ?? "";
	const hasSegs  = showMiniSectors && sector.Segments.length > 0;

	const isSessionFastest = bestSector?.Position === 1;

	// Delta only for current-lap sector (sector.Value), not a cached prev-lap value
	const deltaMs = curTime && bestTime ? parseTimeMs(curTime) - parseTimeMs(bestTime) : null;

	const displayTime = curTime || prevTime;

	return (
		<span className="flex flex-col gap-[3px]">
			{/* ── Line 1: personal best — always the standing reference ── */}
			<span
				className={clsx("tabular-nums whitespace-nowrap", {
					"text-violet-400": isSessionFastest,
					"text-zinc-300":   !isSessionFastest && !!bestTime,
					"text-zinc-700":   !bestTime,
				})}
			>
				{bestTime || "---"}
			</span>

			{/* ── Line 2: mini-bars (always) + current/prev time + Δ ── */}
			<span className="flex items-center gap-[0.5ch] whitespace-nowrap text-[11px] leading-none">
				{hasSegs && (
					<span className="flex items-center gap-px">
						{sector.Segments.map((seg, j) => (
							<MiniBlock key={j} status={seg.Status} />
						))}
					</span>
				)}
				{displayTime && (
					<span
						className={clsx("tabular-nums", {
							"text-violet-400":  sector.OverallFastest,
							"text-emerald-400": !sector.OverallFastest && sector.PersonalFastest,
							"text-zinc-400":    !sector.OverallFastest && !sector.PersonalFastest && !!curTime,
							"text-zinc-700":    !curTime,
						})}
					>
						{displayTime}
					</span>
				)}
				{deltaMs !== null && (
					<span
						className={clsx("tabular-nums font-bold", {
							"text-emerald-400": deltaMs < 0,
							"text-red-500":     deltaMs > 0,
						})}
					>
						{formatDelta(deltaMs)}
					</span>
				)}
			</span>
		</span>
	);
}

function MiniBlock({ status }: { status: number }) {
	return (
		<span
			className={clsx("leading-none", {
				"text-amber-400":   status === 2048 || status === 2052,
				"text-emerald-400": status === 2049,
				"text-violet-400":  status === 2051,
				"text-blue-400":    status === 2064,
				"text-zinc-800":    status === 0,
			})}
		>
			{status === 0 ? "▒" : "█"}
		</span>
	);
}
