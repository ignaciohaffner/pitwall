"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { utc } from "moment";
import clsx from "clsx";

import type { Driver, RadioCapture } from "@/types/state.type";
import { useSettingsStore } from "@/stores/useSettingsStore";

import DriverTag from "@/components/driver/DriverTag";

type Props = {
	driver: Driver;
	capture: RadioCapture;
	basePath: string;
};

export default function RadioMessage({ driver, capture, basePath }: Props) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const [playing, setPlaying] = useState<boolean>(false);
	const [duration, setDuration] = useState<number>(10);
	const [progress, setProgress] = useState<number>(0);

	const loadMeta = () => {
		if (!audioRef.current) return;
		setDuration(audioRef.current.duration);
	};

	const onEnded = () => {
		setPlaying(false);
		setProgress(0);
		if (intervalRef.current) clearInterval(intervalRef.current);
	};

	const updateProgress = () => {
		if (!audioRef.current) return;
		setProgress(audioRef.current.currentTime);
	};

	const togglePlayback = () => {
		setPlaying((old) => {
			if (!audioRef.current) return old;
			if (!old) {
				audioRef.current.play();
				intervalRef.current = setInterval(updateProgress, 100);
			} else {
				audioRef.current.pause();
				if (intervalRef.current) clearInterval(intervalRef.current);
				setTimeout(() => {
					setProgress(0);
					audioRef.current?.fastSeek(0);
				}, 10000);
			}
			return !old;
		});
	};

	const favoriteDriver = useSettingsStore((state) => state.favoriteDrivers.includes(driver.RacingNumber));
	const localTime = utc(capture.Utc).local().format("HH:mm:ss");
	const pct = Math.min(1, progress / duration);
	const barFilled = Math.round(pct * 20);
	const barEmpty = 20 - barFilled;

	return (
		<motion.li
			animate={{ opacity: 1 }}
			initial={{ opacity: 0 }}
			className={clsx("flex items-center gap-[1ch] border-b border-zinc-900 px-2 py-0.5 font-mono text-sm", {
				"bg-sky-950/40": favoriteDriver,
			})}
		>
			<time className="shrink-0 text-[11px] tabular-nums text-zinc-600">{localTime}</time>
			<DriverTag teamColor={driver.TeamColour} short={driver.Tla} />
			<button
				onClick={togglePlayback}
				className="shrink-0 text-zinc-500 hover:text-zinc-200 transition-colors"
				aria-label={playing ? "Pause" : "Play"}
			>
				{playing ? "■" : "►"}
			</button>
			<span className="text-[11px] tabular-nums text-zinc-600 select-none">
				{"█".repeat(barFilled)}{"░".repeat(barEmpty)}
			</span>
			<audio
				preload="none"
				src={`${basePath}${capture.Path}`}
				ref={audioRef}
				onEnded={onEnded}
				onLoadedMetadata={loadMeta}
			/>
		</motion.li>
	);
}
