"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const TICK_MS = 30;
// Long messages type faster: never more than ~1.5 s.
const MAX_TICKS = 50;

type Props = {
	text: string;
	/** Type the text out; otherwise (or with reduced motion) it shows at once. */
	animate?: boolean;
	className?: string;
};

// A message that types itself out when it arrives. Screen readers get the whole text at once.
export default function TypingText({ text, animate = false, className }: Props) {
	const reduced = useReducedMotion();
	const [shown, setShown] = useState(animate ? 0 : text.length);
	const done = reduced || shown >= text.length;

	useEffect(() => {
		if (done) return;
		const step = Math.max(1, Math.ceil(text.length / MAX_TICKS));
		const t = setTimeout(() => setShown((s) => Math.min(text.length, s + step)), TICK_MS);
		return () => clearTimeout(t);
	}, [done, shown, text.length]);

	if (done) return <p className={className}>{text}</p>;

	return (
		<p className={className}>
			<span className="sr-only">{text}</span>
			<span aria-hidden="true">
				{text.slice(0, shown)}
				<span className="ml-px inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-fg-2" />
			</span>
		</p>
	);
}
