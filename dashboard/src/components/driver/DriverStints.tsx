import clsx from "clsx";
import type { Stint } from "@/types/state.type";

type Props = {
	stints: Stint[] | undefined;
};

const COMPOUND_COLOR: Record<string, string> = {
	soft: "text-red-400",
	medium: "text-yellow-300",
	hard: "text-zinc-200",
	intermediate: "text-green-400",
	wet: "text-blue-400",
};

export default function DriverStints({ stints }: Props) {
	if (!stints || stints.length === 0) return <span />;

	return (
		<span className="flex items-baseline gap-[1.5ch] tabular-nums">
			{stints.map((stint, i) => {
				const isLast = i === stints.length - 1;
				const compound = stint.Compound?.toLowerCase() ?? "";
				const color = COMPOUND_COLOR[compound] ?? "text-zinc-600";
				const letter = compound ? compound[0].toUpperCase() : "?";
				const laps = stint.TotalLaps ?? 0;
				return (
					<span key={i} className="flex items-baseline gap-[0.3ch]">
						<span className={clsx("text-[11px] font-bold", color)}>{letter}</span>
						<span className={clsx("text-[11px]", isLast ? "text-zinc-400" : "text-zinc-600")}>
							{laps}
						</span>
					</span>
				);
			})}
		</span>
	);
}
