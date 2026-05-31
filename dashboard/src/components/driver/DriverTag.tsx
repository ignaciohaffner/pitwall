import clsx from "clsx";

type Props = {
	teamColor: string;
	short: string;
	position?: number;
	className?: string;
};

export default function DriverTag({ position, teamColor, short, className }: Props) {
	return (
		<span className={clsx("flex items-baseline gap-0 overflow-hidden", className)}>
			<span style={{ color: teamColor ? `#${teamColor}` : "#444" }} className="mr-[0.5ch] shrink-0">▌</span>
			{position !== undefined && (
				<span className="w-[2ch] shrink-0 text-right tabular-nums text-zinc-600">{position}</span>
			)}
			<span className="ml-[0.5ch] font-bold" style={{ color: teamColor ? `#${teamColor}` : "#888" }}>
				{short}
			</span>
		</span>
	);
}
