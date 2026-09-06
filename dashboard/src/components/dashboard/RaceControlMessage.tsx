"use client";

import { motion } from "motion/react";
import { utc } from "moment";
import clsx from "clsx";

import type { Message } from "@/types/state.type";
import { useSettingsStore } from "@/stores/useSettingsStore";

type Props = {
	msg: Message;
};

const FLAG_ABBR: Record<string, string> = {
	RED: "RED",
	YELLOW: "YEL",
	"DOUBLE YELLOW": "DBL",
	GREEN: "GRN",
	CHEQUERED: "CHQ",
	"SAFETY CAR": "SC",
	"VIRTUAL SAFETY CAR": "VSC",
};

const FLAG_COLOR: Record<string, string> = {
	RED: "text-red-500",
	YELLOW: "text-amber-400",
	"DOUBLE YELLOW": "text-amber-400",
	GREEN: "text-emerald-400",
	CHEQUERED: "text-zinc-100",
	"SAFETY CAR": "text-amber-400",
	"VIRTUAL SAFETY CAR": "text-amber-400",
};

const getDriverNumber = (msg: Message) => {
	const match = msg.Message.match(/CAR (\d+)/);
	return match?.[1];
};

export function RaceControlMessage({ msg }: Props) {
	const favoriteDriver = useSettingsStore((state) =>
		state.favoriteDrivers.includes(getDriverNumber(msg) ?? ""),
	);

	const localTime = utc(msg.Utc).local().format("HH:mm:ss");
	const flagLabel = msg.Flag && msg.Flag !== "CLEAR" ? FLAG_ABBR[msg.Flag] ?? msg.Flag : null;
	const flagColor = msg.Flag ? FLAG_COLOR[msg.Flag] ?? "text-zinc-400" : "text-zinc-400";

	return (
		<motion.li
			layout="position"
			animate={{ opacity: 1 }}
			initial={{ opacity: 0 }}
			className={clsx(
				"flex flex-wrap items-baseline gap-x-[1ch] border-b border-zinc-900 px-2 py-0.5 font-mono text-sm leading-snug",
				{ "bg-sky-950/40": favoriteDriver },
			)}
		>
			<time className="shrink-0 text-[11px] tabular-nums text-zinc-600">{localTime}</time>
			{msg.Lap && (
				<span className="shrink-0 text-[11px] tabular-nums text-zinc-700">L{msg.Lap}</span>
			)}
			{flagLabel && (
				<span className={clsx("shrink-0 text-[11px] font-bold tracking-wide", flagColor)}>
					[{flagLabel}]
				</span>
			)}
			<span className="text-zinc-300">{msg.Message}</span>
		</motion.li>
	);
}
