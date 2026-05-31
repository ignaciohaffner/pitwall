import { AnimatePresence, LayoutGroup } from "motion/react";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { useDataStore } from "@/stores/useDataStore";

import { sortPos } from "@/lib/sorting";

import Driver, { DRIVER_GRID_COLS, DRIVER_GRID_GAP } from "@/components/driver/Driver";

export default function LeaderBoard() {
	const drivers = useDataStore(({ state }) => state?.DriverList);
	const driversTiming = useDataStore(({ state }) => state?.TimingData);

	const showTableHeader = useSettingsStore((state) => state.tableHeaders);

	return (
		<div className="w-full overflow-x-auto font-mono text-base">
			{showTableHeader && <TableHeaders />}

			{(!drivers || !driversTiming) &&
				new Array(20).fill("").map((_, index) => <SkeletonDriver key={`driver.loading.${index}`} />)}

			<LayoutGroup key="drivers">
				{drivers && driversTiming && (
					<AnimatePresence>
						{Object.values(driversTiming.Lines)
							.sort(sortPos)
							.map((timingDriver, index) => (
								<Driver
									key={`leaderBoard.driver.${timingDriver.RacingNumber}`}
									position={index + 1}
									driver={drivers[timingDriver.RacingNumber]}
									timingDriver={timingDriver}
								/>
							))}
					</AnimatePresence>
				)}
			</LayoutGroup>
		</div>
	);
}

const TableHeaders = () => (
	<div
		className="grid items-center border-b-2 border-zinc-600 py-0.5 pl-2 pr-1 font-mono text-base leading-none"
		style={{ columnGap: DRIVER_GRID_GAP, gridTemplateColumns: DRIVER_GRID_COLS }}
	>
		<span className="text-[11px] uppercase tracking-widest text-zinc-500">POS</span>
		<span className="text-[11px] uppercase tracking-widest text-zinc-500">OVT</span>
		<span className="text-[11px] uppercase tracking-widest text-zinc-500">TYRE</span>
		<span className="text-right text-[11px] uppercase tracking-widest text-zinc-500">INFO</span>
		<span className="text-right text-[11px] uppercase tracking-widest text-zinc-500">GAP</span>
		<span className="text-right text-[11px] uppercase tracking-widest text-zinc-500">LAP</span>
		<span className="text-[11px] uppercase tracking-widest text-zinc-500">SECTORS</span>
	</div>
);

const SkeletonDriver = () => (
	<div className="border-b border-zinc-900 py-0.5 pl-2 pr-1 font-mono text-base leading-none text-zinc-800">
		▌ -- ??? --  --------  ----------  ▒▒▒▒▒▒▒▒ ---  ▒▒▒▒▒▒▒▒ ---  ▒▒▒▒▒▒▒▒ ---
	</div>
);
