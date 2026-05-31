import clsx from "clsx";

import type { CarDataChannels } from "@/types/state.type";

type Props = {
	carData: CarDataChannels | undefined;
};

export default function DriverBattery({ carData }: Props) {
	// Channel 45 only exists in pre-2026 data (DRS). Absent in 2026+ streams.
	const overtake = carData?.["45"] ?? 0;
	const overtakeActive = overtake > 9;
	const overtakeAvailable = overtake === 8;

	return (
		<div className="flex items-center justify-center">
			<span
				className={clsx("rounded px-0.5 font-mono text-xs font-black leading-none", {
					"bg-emerald-500 text-black": overtakeActive,
					"border border-zinc-500 text-zinc-400": overtakeAvailable && !overtakeActive,
					"border border-zinc-800 text-zinc-700": !overtakeActive && !overtakeAvailable,
				})}
			>
				OVT
			</span>
		</div>
	);
}
