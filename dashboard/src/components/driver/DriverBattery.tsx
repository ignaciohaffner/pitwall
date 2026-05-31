import clsx from "clsx";

import type { CarDataChannels } from "@/types/state.type";

type Props = {
	carData: CarDataChannels | undefined;
};

export default function DriverBattery({ carData }: Props) {
	const overtake = carData?.["45"] ?? 0;
	const overtakeActive = overtake > 9;
	const overtakeAvailable = overtake === 8;

	return (
		<span
			className={clsx("block", {
				"font-bold text-emerald-400": overtakeActive,
				"text-zinc-500": overtakeAvailable && !overtakeActive,
				"text-zinc-800": !overtakeActive && !overtakeAvailable,
			})}
		>
			{overtakeActive ? "OVT" : overtakeAvailable ? "ovt" : "---"}
		</span>
	);
}
