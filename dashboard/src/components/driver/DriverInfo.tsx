import clsx from "clsx";

import type { TimingDataDriver } from "@/types/state.type";

type Props = {
	timingDriver: TimingDataDriver;
	gridPos?: number;
};

export default function DriverInfo({ timingDriver, gridPos }: Props) {
	const positionChange = gridPos ? gridPos - parseInt(timingDriver.Position) : 0;
	const gain = positionChange > 0;
	const loss = positionChange < 0;

	const status = timingDriver.KnockedOut
		? "OUT"
		: !!timingDriver.Cutoff
			? "CUT"
			: timingDriver.Retired
				? "RET"
				: timingDriver.Stopped
					? "STP"
					: timingDriver.InPit
						? "PIT"
						: timingDriver.PitOut
							? "OUT"
							: null;

	if (status) {
		return (
			<span
				className={clsx("block w-full text-right", {
					"text-cyan-400": status === "PIT" || status === "OUT",
					"text-red-400": status === "RET" || status === "STP" || status === "CUT",
				})}
			>
				{status}
			</span>
		);
	}

	if (positionChange !== 0) {
		return (
			<span
				className={clsx("block w-full text-right tabular-nums", {
					"text-emerald-400": gain,
					"text-red-400": loss,
				})}
			>
				{gain ? `+${positionChange}` : positionChange}
			</span>
		);
	}

	return (
		<span className="block w-full text-right tabular-nums text-zinc-700">
			{timingDriver.NumberOfLaps ?? 0}L
		</span>
	);
}
