"use client";

import clsx from "clsx";

type Props = {
	connected?: boolean;
};

export default function ConnectionStatus({ connected }: Props) {
	return (
		<span
			className={clsx(
				"font-mono text-sm font-bold leading-none",
				connected ? "text-emerald-500" : "animate-pulse text-red-500",
			)}
		>
			{connected ? "●" : "○"}
		</span>
	);
}
