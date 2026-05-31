import clsx from "clsx";

import type { Stint } from "@/types/state.type";

type Props = {
	stints: Stint[] | undefined;
};

const COMPOUND_LETTER: Record<string, string> = {
	soft: "S",
	medium: "M",
	hard: "H",
	intermediate: "I",
	wet: "W",
};

const COMPOUND_COLOR: Record<string, string> = {
	soft: "text-red-400",
	medium: "text-yellow-300",
	hard: "text-zinc-100",
	intermediate: "text-green-400",
	wet: "text-blue-400",
};

export default function DriverTire({ stints }: Props) {
	const stops = stints ? stints.length - 1 : 0;
	const currentStint = stints ? stints[stints.length - 1] : null;
	const compound = currentStint?.Compound?.toLowerCase() ?? "";
	const known = compound in COMPOUND_LETTER;
	const letter = known ? COMPOUND_LETTER[compound] : "?";
	const color = known ? COMPOUND_COLOR[compound] : "text-zinc-500";
	const laps = currentStint?.TotalLaps ?? 0;
	const isNew = currentStint?.New;

	return (
		<span className="flex items-baseline gap-px whitespace-nowrap tabular-nums">
			<span className={clsx("font-bold", color)}>{letter}</span>
			<span className="text-zinc-300">{laps}</span>
			{!isNew && <span className="text-zinc-600">*</span>}
			<span className="ml-[0.5ch] text-zinc-700">p{stops}</span>
		</span>
	);
}
