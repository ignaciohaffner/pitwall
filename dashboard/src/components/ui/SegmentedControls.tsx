"use client";

import clsx from "clsx";

type Props<T> = {
	id?: string;
	className?: string;
	options: { label: string; value: T }[];
	selected: T;
	onSelect?: (val: T) => void;
};

export default function SegmentedControls<T>({ id, className, options, selected, onSelect }: Props<T>) {
	return (
		<div id={id} className={clsx("inline-flex border border-zinc-700", className)}>
			{options.map((option) => {
				const isActive = option.value === selected;
				return (
					<button
						key={String(option.label)}
						onClick={() => onSelect?.(option.value)}
						className={clsx(
							"cursor-pointer px-4 py-1.5 font-mono text-[11px] tracking-widest uppercase transition-colors",
							isActive ? "bg-zinc-200 text-black" : "text-zinc-600 hover:text-zinc-300",
						)}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
