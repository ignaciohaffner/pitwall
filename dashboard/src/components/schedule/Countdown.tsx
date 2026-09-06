"use client";

import { useEffect, useRef, useState } from "react";
import { duration, now, utc } from "moment";

import type { Session } from "@/types/schedule.type";

type Props = {
	next: Session;
	type: "race" | "other";
};

export default function Countdown({ next, type }: Props) {
	const [[days, hours, minutes, seconds], setDuration] = useState<
		[number | null, number | null, number | null, number | null]
	>([null, null, null, null]);

	const nextMoment = utc(next.start);
	const requestRef = useRef<number | null>(null);

	useEffect(() => {
		const animateNextFrame = () => {
			const diff = duration(nextMoment.diff(now()));
			const d = parseInt(diff.asDays().toString());

			if (diff.asSeconds() > 0) {
				setDuration([d, diff.hours(), diff.minutes(), diff.seconds()]);
			} else {
				setDuration([0, 0, 0, 0]);
			}

			requestRef.current = requestAnimationFrame(animateNextFrame);
		};

		requestRef.current = requestAnimationFrame(animateNextFrame);
		return () => (requestRef.current ? cancelAnimationFrame(requestRef.current) : void 0);
	}, [nextMoment]);

	const fmt = (n: number | null) => (n !== null ? String(n).padStart(2, "0") : "--");

	return (
		<div className="font-mono">
			<p className="mb-2 text-[11px] tracking-widest text-zinc-500 uppercase">
				next {type === "race" ? "race" : "session"} in
			</p>

			<div className="flex items-end gap-[2ch]">
				<div>
					<p className="text-3xl text-white tabular-nums">{fmt(days)}</p>
					<p className="text-[11px] tracking-widest text-zinc-600 uppercase">days</p>
				</div>
				<div>
					<p className="text-3xl text-white tabular-nums">{fmt(hours)}</p>
					<p className="text-[11px] tracking-widest text-zinc-600 uppercase">hours</p>
				</div>
				<div>
					<p className="text-3xl text-white tabular-nums">{fmt(minutes)}</p>
					<p className="text-[11px] tracking-widest text-zinc-600 uppercase">min</p>
				</div>
				<div>
					<p className="text-3xl text-white tabular-nums">{fmt(seconds)}</p>
					<p className="text-[11px] tracking-widest text-zinc-600 uppercase">sec</p>
				</div>
			</div>
		</div>
	);
}
