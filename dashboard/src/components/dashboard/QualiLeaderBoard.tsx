"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup } from "motion/react";

import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { sortPos } from "@/lib/sorting";
import { parseTimeMs } from "@/lib/timeUtils";

import QualiDriver, { QUALI_GRID_COLS, QUALI_GRID_GAP } from "@/components/driver/QualiDriver";
import QualiHelpModal from "@/components/dashboard/QualiHelpModal";

export default function QualiLeaderBoard() {
	const drivers = useDataStore(({ state }) => state?.DriverList);
	const driversTiming = useDataStore(({ state }) => state?.TimingData);
	const timingStats = useDataStore(({ state }) => state?.TimingStats);
	const showTableHeader = useSettingsStore((state) => state.tableHeaders);
	const [helpOpen, setHelpOpen] = useState(false);

	// Find fastest sector time per sector across all drivers
	const fastestSectors: (number | null)[] = [null, null, null];
	if (timingStats) {
		Object.values(timingStats.Lines).forEach((statsDriver) => {
			statsDriver.BestSectors?.forEach((sector, i) => {
				if (sector.Value) {
					const ms = parseTimeMs(sector.Value);
					if (ms < Infinity && (fastestSectors[i] === null || ms < fastestSectors[i]!)) {
						fastestSectors[i] = ms;
					}
				}
			});
		});
	}

	const sessionPart = driversTiming?.SessionPart;

	return (
		<>
			{helpOpen && <QualiHelpModal onClose={() => setHelpOpen(false)} />}

			<div className="w-full overflow-x-auto font-mono text-base">
				<div className="flex items-center justify-between border-b border-zinc-800 px-2 py-0.5">
					<span className="text-[11px] uppercase tracking-widest text-zinc-600">
						{sessionPart ? `Q${sessionPart}` : "QUALIFYING"}
					</span>
					<button
						onClick={() => setHelpOpen(true)}
						className="text-[11px] uppercase tracking-widest text-zinc-700 hover:text-zinc-400 transition-colors"
						aria-label="Qualifying mode help"
					>
						? ayuda
					</button>
				</div>

			{showTableHeader && <QualiHeaders fastestSectors={fastestSectors} />}

			{(!drivers || !driversTiming) &&
				new Array(20).fill("").map((_, i) => <SkeletonDriver key={`quali.skeleton.${i}`} />)}

			<LayoutGroup key="quali-drivers">
				{drivers && driversTiming && (
					<AnimatePresence>
						{Object.values(driversTiming.Lines)
							.sort(sortPos)
							.map((timingDriver, index) => (
								<QualiDriver
									key={`quali.driver.${timingDriver.RacingNumber}`}
									position={index + 1}
									driver={drivers[timingDriver.RacingNumber]}
									timingDriver={timingDriver}
									timingStats={timingStats?.Lines[timingDriver.RacingNumber]}
									fastestSectors={fastestSectors}
								/>
							))}
					</AnimatePresence>
				)}
			</LayoutGroup>
		</div>
		</>
	);
}

function QualiHeaders({ fastestSectors }: { fastestSectors: (number | null)[] }) {
	return (
		<div
			className="grid items-end border-b-2 border-zinc-600 py-0.5 pl-2 pr-1 font-mono text-base leading-none"
			style={{ columnGap: QUALI_GRID_GAP, gridTemplateColumns: QUALI_GRID_COLS }}
		>
			<span className="text-[11px] uppercase tracking-widest text-zinc-500">POS</span>
			<span className="text-right text-[11px] uppercase tracking-widest text-zinc-500">GAP</span>
			<span className="text-right text-[11px] uppercase tracking-widest text-zinc-500">BEST</span>

			{[0, 1, 2].map((i) => (
				<span key={`hdr-s${i}`} className="flex flex-col gap-[2px]">
					{/* Fastest sector time across all drivers (tiny reference) */}
					<span className="text-[10px] tabular-nums text-zinc-700">
						{fastestSectors[i] !== null ? (fastestSectors[i]! / 1000).toFixed(3) : ""}
					</span>
					{/* Column label + sub-label explaining the two rows */}
					<span className="flex items-baseline gap-[0.5ch]">
						<span className="text-[11px] uppercase tracking-widest text-zinc-500">S{i + 1}</span>
						<span className="text-[9px] text-zinc-700">cur/bl Δ</span>
					</span>
				</span>
			))}

			<span className="text-[11px] uppercase tracking-widest text-zinc-500">TYRE</span>
		</div>
	);
}

const SkeletonDriver = () => (
	<div className="border-b border-zinc-900 py-0.5 pl-2 pr-1 font-mono text-base leading-none text-zinc-800">
		▌ -- ??? --------  --------  ------  ------  ------  ▒▒▒▒▒▒▒▒ ---  ▒▒▒▒▒▒▒▒ ---  ▒▒▒▒▒▒▒▒ ---
	</div>
);
