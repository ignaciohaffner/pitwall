"use client";

import type { ReactNode } from "react";
import clsx from "clsx";

type Props = {
	children: ReactNode;
	onClick?: () => void;
	className?: string;
};

export default function Button({ children, onClick, className }: Props) {
	return (
		<button
			className={clsx(
				"cursor-pointer border border-zinc-700 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white",
				className,
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
}
