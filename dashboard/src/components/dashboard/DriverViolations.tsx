import type { Driver, TimingData } from "@/types/state.type";

import { calculatePosition } from "@/lib/calculatePosition";

import DriverTag from "@/components/driver/DriverTag";

type Props = {
	driver: Driver;
	driverViolations: number;
	driversTiming: TimingData | undefined;
};

export default function DriverViolations({ driver, driverViolations, driversTiming }: Props) {
	const hasPenalty = driverViolations > 4;
	const penaltySeconds = Math.round(driverViolations / 5) * 5;

	return (
		<div className="flex items-baseline gap-[1ch] border-b border-zinc-900 px-2 py-0.5 font-mono text-sm">
			<DriverTag teamColor={driver.TeamColour} short={driver.Tla} />
			<span className="text-amber-400">{driverViolations}v</span>
			{hasPenalty && <span className="text-red-500">+{penaltySeconds}s</span>}
			{hasPenalty && driversTiming && (
				<span className="text-zinc-600">
					→ {calculatePosition(penaltySeconds, driver.RacingNumber, driversTiming)}th
				</span>
			)}
		</div>
	);
}
