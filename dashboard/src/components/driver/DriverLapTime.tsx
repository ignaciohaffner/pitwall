import clsx from "clsx";

import type { TimingDataDriver } from "@/types/state.type";

type Props = {
	last: TimingDataDriver["LastLapTime"];
	best: TimingDataDriver["BestLapTime"];
	hasFastest: boolean;
};

export default function DriverLapTime({ last, best, hasFastest }: Props) {
	const value = last.Value || best.Value || "";

	return (
		<span
			className={clsx("block w-full text-right tabular-nums", {
				"text-violet-400": last.OverallFastest || hasFastest,
				"text-emerald-400": !last.OverallFastest && !hasFastest && last.PersonalFastest,
				"text-zinc-300": !last.OverallFastest && !last.PersonalFastest && !hasFastest && !!last.Value,
				"text-zinc-600": !last.Value && !!best.Value,
				"text-zinc-800": !last.Value && !best.Value,
			})}
		>
			{value || "---"}
		</span>
	);
}
