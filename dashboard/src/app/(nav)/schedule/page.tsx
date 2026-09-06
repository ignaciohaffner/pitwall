import { Suspense } from "react";

import NextRound from "@/components/schedule/NextRound";
import Schedule from "@/components/schedule/Schedule";

export default async function SchedulePage() {
	return (
		<div className="font-mono">
			<div className="my-4 border-b border-zinc-800 pb-1">
				<p className="text-[11px] tracking-widest text-zinc-500 uppercase">up next</p>
				<p className="text-[10px] text-zinc-700">all times local</p>
			</div>

			<Suspense fallback={<NextRoundLoading />}>
				<NextRound />
			</Suspense>

			<div className="my-4 border-b border-zinc-800 pb-1">
				<p className="text-[11px] tracking-widest text-zinc-500 uppercase">schedule</p>
				<p className="text-[10px] text-zinc-700">all times local</p>
			</div>

			<Suspense fallback={<FullScheduleLoading />}>
				<Schedule />
			</Suspense>
		</div>
	);
}

const RoundLoading = () => {
	return (
		<div className="flex flex-col gap-2 font-mono">
			<p className="animate-pulse text-sm text-zinc-700">▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌</p>
			<div className="grid grid-cols-3 gap-4 pt-1">
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={`day.${i}`} className="flex flex-col gap-2">
						<p className="animate-pulse text-[11px] text-zinc-700">▌▌▌▌▌▌▌</p>
						<p className="animate-pulse text-xs text-zinc-700">▌▌▌▌▌▌▌▌▌▌▌▌</p>
						<p className="animate-pulse text-xs text-zinc-700">▌▌▌▌▌▌▌▌</p>
					</div>
				))}
			</div>
		</div>
	);
};

const NextRoundLoading = () => {
	return (
		<div className="mb-4 grid grid-cols-1 gap-8 sm:grid-cols-2">
			<div className="flex flex-col gap-4 font-mono">
				<p className="animate-pulse text-3xl text-zinc-700 tabular-nums">-- -- -- --</p>
				<p className="animate-pulse text-[11px] tracking-widest text-zinc-700 uppercase">▌▌▌▌▌▌▌▌▌▌</p>
			</div>
			<RoundLoading />
		</div>
	);
};

const FullScheduleLoading = () => {
	return (
		<div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-2">
			{Array.from({ length: 6 }).map((_, i) => (
				<RoundLoading key={`round.${i}`} />
			))}
		</div>
	);
};
