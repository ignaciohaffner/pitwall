"use client";

import { now, utc } from "moment";
import clsx from "clsx";

import type { Round as RoundType } from "@/types/schedule.type";

import { groupSessionByDay } from "@/lib/groupSessionByDay";
import { formatDayRange, formatMonth } from "@/lib/dateFormatter";

type Props = {
	round: RoundType;
	nextName?: string;
};

const countryCodeMap: Record<string, string> = {
	Australia: "AUS",
	Austria: "AUT",
	Azerbaijan: "AZE",
	Bahrain: "BRN",
	Belgium: "BEL",
	Brazil: "BRA",
	Canada: "CAN",
	China: "CHN",
	Spain: "ESP",
	France: "FRA",
	"Great Britain": "GBR",
	"United Kingdom": "GBR",
	Germany: "GER",
	Hungary: "HUN",
	Italy: "ITA",
	Japan: "JPN",
	"Saudi Arabia": "KSA",
	Mexico: "MEX",
	Monaco: "MON",
	Netherlands: "NED",
	Portugal: "POR",
	Qatar: "QAT",
	Singapore: "SGP",
	"United Arab Emirates": "UAE",
	"United States": "USA",
};

export default function Round({ round, nextName }: Props) {
	const countryCode = countryCodeMap[round.countryName] ?? "???";

	return (
		<div className={clsx("font-mono", round.over && "opacity-50")}>
			<div className="flex items-center justify-between border-b border-zinc-800 pb-2">
				<div className="flex items-center gap-[2ch]">
					<span className="text-sm text-zinc-500">[{countryCode}]</span>
					<span className="text-sm uppercase tracking-wide text-zinc-300">{round.countryName}</span>
					{round.name === nextName && (
						utc().isBetween(utc(round.start), utc(round.end)) ? (
							<span className="text-[11px] uppercase tracking-widest text-emerald-500">● current</span>
						) : (
							<span className="text-[11px] uppercase tracking-widest text-indigo-400">→ up next</span>
						)
					)}
					{round.over && <span className="text-[11px] uppercase tracking-widest text-zinc-600">✗ over</span>}
				</div>

				<div className="flex items-center gap-[1ch] text-sm tabular-nums">
					<span className="text-zinc-400">{formatMonth(round.start, round.end)}</span>
					<span className="text-zinc-600">{formatDayRange(round.start, round.end)}</span>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-4 pt-2">
				{groupSessionByDay(round.sessions).map((day, i) => (
					<div className="flex flex-col" key={`round.day.${i}`}>
						<p className="my-2 text-[11px] uppercase tracking-widest text-zinc-500">
							{utc(day.date).local().format("ddd")}
						</p>

						<div className="flex flex-col gap-2">
							{day.sessions.map((session, j) => (
								<div
									key={`round.day.${i}.session.${j}`}
									className={clsx("flex flex-col", !round.over && utc(session.end).isBefore(now()) && "opacity-50")}
								>
									<p className="w-28 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-zinc-300 sm:w-auto">
										{session.kind}
									</p>
									<p className="text-[11px] tabular-nums text-zinc-600">
										{utc(session.start).local().format("HH:mm")}
										{" - "}
										{utc(session.end).local().format("HH:mm")}
									</p>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
