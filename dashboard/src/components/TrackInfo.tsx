"use client";

import clsx from "clsx";

import { useDataStore } from "@/stores/useDataStore";

import { getTrackStatusMessage } from "@/lib/getTrackStatusMessage";

const STATUS_TEXT_COLOR: Record<string, string> = {
	"Track Clear": "text-emerald-400",
	"Yellow Flag": "text-amber-400",
	Flag: "text-amber-400",
	"Safety Car": "text-amber-400",
	"Red Flag": "text-red-400",
	"VSC Deployed": "text-amber-400",
	"VSC Ending": "text-amber-300",
};

export default function TrackInfo() {
	const lapCount = useDataStore((state) => state.state?.LapCount);
	const track = useDataStore((state) => state.state?.TrackStatus);

	const status = getTrackStatusMessage(track?.Status ? parseInt(track.Status) : undefined);
	const statusColor = status ? (STATUS_TEXT_COLOR[status.message] ?? "text-zinc-300") : "text-zinc-700";

	return (
		<span className="flex items-center gap-[2ch] font-mono text-sm">
			{lapCount && (
				<span>
					<span className="text-zinc-600">LAP</span>{" "}
					<span className="font-bold tabular-nums text-white">{lapCount.CurrentLap}</span>
					<span className="text-zinc-700">/</span>
					<span className="tabular-nums text-zinc-400">{lapCount.TotalLaps}</span>
				</span>
			)}

			<span className="text-zinc-700">│</span>

			{status ? (
				<span className={clsx("font-bold uppercase tracking-wide", statusColor)}>
					■ {status.message}
				</span>
			) : (
				<span className="text-zinc-700">■ ---</span>
			)}
		</span>
	);
}
