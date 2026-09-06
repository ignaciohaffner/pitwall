"use client";

import clsx from "clsx";

type Props = {
	connected?: boolean;
};

export default function ConnectionStatus({ connected }: Props) {
	return (
		<span
			className={clsx(
				"font-mono text-sm leading-none font-bold",
				connected ? "text-emerald-500" : "animate-pulse text-red-500",
			)}
		>
			{connected ? "●" : "○"}
		</span>
	);
}
