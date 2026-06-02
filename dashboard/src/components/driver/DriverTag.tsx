type Props = {
	teamColor: string;
	short: string;
	position?: number;
	className?: string;
};

function isLight(hex: string): boolean {
	if (!hex || hex.length < 6) return false;
	const r = parseInt(hex.slice(0, 2), 16);
	const g = parseInt(hex.slice(2, 4), 16);
	const b = parseInt(hex.slice(4, 6), 16);
	return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export default function DriverTag({ position, teamColor, short, className }: Props) {
	const bg = teamColor ? `#${teamColor}` : "#444";
	const fg = teamColor ? (isLight(teamColor) ? "#000" : "#fff") : "#fff";

	return (
		<span className={`flex items-baseline gap-[0.5ch] overflow-hidden ${className ?? ""}`}>
			{position !== undefined && (
				<span className="w-[2ch] shrink-0 text-right tabular-nums text-zinc-600">{position}</span>
			)}
			<span
				className="shrink-0 px-[0.3ch] font-bold leading-none"
				style={{ backgroundColor: bg, color: fg }}
			>
				{short}
			</span>
		</span>
	);
}
