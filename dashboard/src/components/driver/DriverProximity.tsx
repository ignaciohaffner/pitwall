import clsx from "clsx";
import type { TimingDataDriver } from "@/types/state.type";

type Props = {
	timingDriver: TimingDataDriver;
};

export default function DriverProximity({ timingDriver }: Props) {
	const raw = timingDriver.IntervalToPositionAhead?.Value ?? "";
	const gap = parseFloat(raw);

	if (isNaN(gap) || gap >= 1.0) return <span className="block w-full" />;

	// 4 segments = 1 second. closer = more filled.
	const SEGMENTS = 4;
	const filled = Math.max(1, Math.ceil((1 - gap) * SEGMENTS));

	return (
		<span
			className={clsx("block text-[11px] leading-none tabular-nums", {
				"text-red-500": gap < 0.3,
				"text-amber-400": gap >= 0.3 && gap < 0.6,
				"text-yellow-300": gap >= 0.6,
			})}
		>
			{"█".repeat(filled)}
			{"░".repeat(SEGMENTS - filled)}
		</span>
	);
}
