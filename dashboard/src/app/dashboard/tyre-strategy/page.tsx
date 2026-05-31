"use client";

import { useDataStore } from "@/stores/useDataStore";
import type { Stint } from "@/types/state.type";

const COMPOUND_COLORS: Record<string, string> = {
	SOFT: "#E8002D",
	MEDIUM: "#FFF200",
	HARD: "#F0F0F0",
	INTERMEDIATE: "#39B54A",
	WET: "#0085FF",
	UNKNOWN: "#888888",
};

const COMPOUND_TEXT: Record<string, string> = {
	SOFT: "#fff",
	MEDIUM: "#000",
	HARD: "#000",
	INTERMEDIATE: "#fff",
	WET: "#fff",
	UNKNOWN: "#fff",
};

const X_TICKS = 10;

export default function TyreStrategy() {
	const timingApp = useDataStore((s) => s.state?.TimingAppData?.Lines);
	const driverList = useDataStore((s) => s.state?.DriverList);
	const totalLaps = useDataStore((s) => s.state?.LapCount?.TotalLaps ?? 0);
	const currentLap = useDataStore((s) => s.state?.LapCount?.CurrentLap ?? 0);

	if (!timingApp || !driverList || totalLaps === 0) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<p className="text-zinc-500">waiting for session data...</p>
			</div>
		);
	}

	const drivers = Object.values(timingApp)
		.filter((d) => driverList[d.RacingNumber])
		.sort((a, b) => a.Line - b.Line);

	const tickInterval = Math.ceil(totalLaps / X_TICKS);
	const ticks = Array.from({ length: Math.floor(totalLaps / tickInterval) + 1 }, (_, i) => i * tickInterval);

	return (
		<div className="flex h-full w-full flex-col p-4">
			<h2 className="mb-4 text-lg font-semibold">Tyre Strategy</h2>

			<div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-auto">
				{drivers.map((d) => {
					const driver = driverList[d.RacingNumber];
					if (!driver) return null;

					return (
						<div key={d.RacingNumber} className="flex items-center gap-2">
							{/* Driver label */}
							<div className="w-10 shrink-0 text-right text-xs font-bold" style={{ color: `#${driver.TeamColour}` }}>
								{driver.Tla}
							</div>

							{/* Bar area */}
							<div className="relative h-6 flex-1 rounded-sm bg-zinc-900">
								{renderStints(d.Stints ?? [], totalLaps, currentLap)}
							</div>
						</div>
					);
				})}

				{/* X axis */}
				<div className="mt-1 flex items-center gap-2">
					<div className="w-10 shrink-0" />
					<div className="relative flex-1">
						{ticks.map((lap) => (
							<span
								key={lap}
								className="absolute -translate-x-1/2 text-xs text-zinc-500"
								style={{ left: `${(lap / totalLaps) * 100}%` }}
							>
								{lap === 0 ? "" : lap}
							</span>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function renderStints(stints: Stint[], totalLaps: number, currentLap: number) {
	let offset = 0;

	return stints.map((stint, i) => {
		const laps = stint.TotalLaps ?? 0;
		if (laps === 0) return null;

		const startLap = offset + 1;
		const endLap = offset + laps;
		const leftPct = (offset / totalLaps) * 100;
		const widthPct = (laps / totalLaps) * 100;
		const compound = stint.Compound ?? "UNKNOWN";
		const bg = COMPOUND_COLORS[compound] ?? COMPOUND_COLORS.UNKNOWN;
		const fg = COMPOUND_TEXT[compound] ?? "#fff";
		const isNew = stint.New === "TRUE";

		offset += laps;

		return (
			<div
				key={i}
				className="absolute top-0 flex h-full items-center overflow-hidden rounded-sm px-1"
				style={{
					left: `${leftPct}%`,
					width: `calc(${widthPct}% - 1px)`,
					backgroundColor: bg,
					outline: isNew ? "none" : "1px solid rgba(255,255,255,0.2)",
				}}
				title={`${compound} — laps ${startLap}–${endLap} (${laps} laps)${isNew ? "" : " — used"}`}
			>
				<span className="truncate text-xs font-semibold leading-none" style={{ color: fg }}>
					{startLap}–{endLap}
					<span className="ml-1 opacity-70">({laps})</span>
				</span>
			</div>
		);
	});
}
