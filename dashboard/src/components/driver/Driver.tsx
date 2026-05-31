"use client";

import clsx from "clsx";
import Link from "next/link";
import { motion } from "motion/react";

import type { Driver, TimingDataDriver } from "@/types/state.type";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { useDataStore } from "@/stores/useDataStore";

import DriverTag from "./DriverTag";
import DriverDRS from "./DriverDRS";
import DriverGap from "./DriverGap";
import DriverTire from "./DriverTire";
import DriverMiniSectors from "./DriverMiniSectors";
import DriverLapTime from "./DriverLapTime";
import DriverInfo from "./DriverInfo";
import DriverCarMetrics from "./DriverCarMetrics";

type Props = {
	position: number;
	driver: Driver;
	timingDriver: TimingDataDriver;
};

// shared grid so headers and rows line up exactly
export const DRIVER_GRID_COLS = "7ch 3ch 7ch 4ch 9ch 9ch auto";
export const DRIVER_GRID_GAP = "2ch";

const hasDRS = (drs: number) => drs > 9;
const possibleDRS = (drs: number) => drs === 8;

const inDangerZone = (position: number, sessionPart: number) => {
	switch (sessionPart) {
		case 1: return position > 15;
		case 2: return position > 10;
		default: return false;
	}
};

export default function Driver({ driver, timingDriver, position }: Props) {
	const sessionPart = useDataStore((state) => state.state?.TimingData?.SessionPart);
	const timingStatsDriver = useDataStore((state) => state.state?.TimingStats?.Lines[driver.RacingNumber]);
	const appTimingDriver = useDataStore((state) => state.state?.TimingAppData?.Lines[driver.RacingNumber]);
	const carData = useDataStore((state) => (state?.carsData ? state.carsData[driver.RacingNumber].Channels : undefined));

	const hasFastest = timingStatsDriver?.PersonalBestLapTime.Position == 1;
	const carMetrics = useSettingsStore((state) => state.carMetrics);
	const favoriteDriver = useSettingsStore((state) => state.favoriteDrivers.includes(driver.RacingNumber));

	return (
		<motion.div
			layout="position"
			className={clsx(
				"group flex w-full items-center border-b border-zinc-900 py-0.5 pl-2 pr-1 font-mono text-base leading-none select-none",
				{
					"opacity-30": timingDriver.KnockedOut || timingDriver.Retired || timingDriver.Stopped,
					"bg-sky-950/60": favoriteDriver,
					"bg-violet-950/60": hasFastest,
					"bg-red-950/60": sessionPart != undefined && inDangerZone(position, sessionPart),
				},
			)}
		>
			<div
				className="grid min-w-0 flex-1 items-center"
				style={{ columnGap: DRIVER_GRID_GAP, gridTemplateColumns: DRIVER_GRID_COLS }}
			>
				<DriverTag short={driver.Tla} teamColor={driver.TeamColour} position={position} />

				<DriverDRS
					on={carData ? hasDRS(carData[45] ?? 0) : false}
					possible={carData ? possibleDRS(carData[45] ?? 0) : false}
					inPit={timingDriver.InPit}
					pitOut={timingDriver.PitOut}
				/>

				<DriverTire stints={appTimingDriver?.Stints} />

				<DriverInfo timingDriver={timingDriver} gridPos={appTimingDriver ? parseInt(appTimingDriver.GridPos) : 0} />

				<DriverGap timingDriver={timingDriver} sessionPart={sessionPart} />

				<DriverLapTime last={timingDriver.LastLapTime} best={timingDriver.BestLapTime} hasFastest={hasFastest} />

				<DriverMiniSectors sectors={timingDriver.Sectors} bestSectors={timingStatsDriver?.BestSectors} />

				{carMetrics && carData && <DriverCarMetrics carData={carData} />}
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
