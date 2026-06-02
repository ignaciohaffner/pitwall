"use client";

import clsx from "clsx";

type Props = {
	className?: string;
	onClick: () => void;
};

export default function SidenavButton({ className, onClick }: Props) {
	return (
		<button
			onClick={onClick}
			className={clsx("flex size-8 cursor-pointer items-center justify-center font-mono text-zinc-600 transition-colors hover:text-zinc-300", className)}
		>
			≡
		</button>
	);
}
