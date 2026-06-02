import clsx from "clsx";

import type { Stint } from "@/types/state.type";
import { useHistoryStore, type LapTimeEntry } from "@/stores/useHistoryStore";
import { getStintBoundaries, stintAvgMs, stintDegradation, formatMs } from "@/lib/stints";

type Props = {
	stints: Stint[] | undefined;
	racingNumber: string;
};

const COMPOUND_COLOR: Record<string, string> = {
	soft: "text-red-400",
	medium: "text-yellow-300",
	hard: "text-zinc-200",
	intermediate: "text-green-400",
	wet: "text-blue-400",
};

const EMPTY_ENTRIES: LapTimeEntry[] = [];

export default function DriverPace({ stints, racingNumber }: Props) {
	const entries = useHistoryStore((s) => s.lapTimes[racingNumber] ?? EMPTY_ENTRIES);

	if (!stints || stints.length === 0) return <span />;

	const boundaries = getStintBoundaries(stints);
	if (boundaries.length === 0) return <span />;

	return (
		<span className="flex items-baseline gap-[2ch] tabular-nums">
			{boundaries.map((b, i) => {
				const compound = b.compound.toLowerCase();
				const letter = compound ? compound[0].toUpperCase() : "?";
				const color = COMPOUND_COLOR[compound] ?? "text-zinc-600";
				const avg = stintAvgMs(entries, b, boundaries);
				const deg = stintDegradation(entries, b, boundaries);
				const isCurrent = b.isActive;

				return (
					<span key={i} className="flex items-baseline gap-[0.4ch]">
						<span className={clsx("text-[11px] font-bold", color)}>{letter}</span>
						{avg != null ? (
							<span className={clsx("text-[11px]", isCurrent ? "text-zinc-300" : "text-zinc-500")}>
								{formatMs(avg)}
							</span>
						) : (
							<span className="text-[11px] text-zinc-700">—</span>
						)}
						{deg != null && (
							<span className={clsx("text-[10px]", deg > 150 ? "text-red-500" : deg < -50 ? "text-emerald-500" : "text-zinc-600")}>
								{deg > 0 ? "+" : ""}{(deg / 1000).toFixed(2)}
							</span>
						)}
					</span>
				);
			})}
		</span>
	);
}
