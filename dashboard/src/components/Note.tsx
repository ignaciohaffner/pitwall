import { type ReactNode } from "react";
import clsx from "clsx";

type Props = {
	className?: string;
	children: ReactNode;
};

export default function Note({ children, className }: Props) {
	return (
		<div className={clsx("border-l-2 border-blue-800 py-2 pl-4 font-mono", className)}>
			<p className="mb-1 text-[11px] uppercase tracking-widest text-blue-600">note</p>
			<p className="text-sm text-zinc-400">{children}</p>
		</div>
	);
}
