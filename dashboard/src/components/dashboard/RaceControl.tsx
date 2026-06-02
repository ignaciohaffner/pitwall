import { AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { useDataStore } from "@/stores/useDataStore";

import { sortUtc } from "@/lib/sorting";

import { RaceControlMessage } from "@/components/dashboard/RaceControlMessage";

export default function RaceControl() {
	const messages = useDataStore((state) => state.state?.RaceControlMessages?.Messages);
	const gmtOffset = useDataStore((state) => state.state?.SessionInfo?.GmtOffset);

	const raceControlChime = useSettingsStore((state) => state.raceControlChime);
	const raceControlChimeVolume = useSettingsStore((state) => state.raceControlChimeVolume);

	const chimeRef = useRef<HTMLAudioElement | null>(null);
	const pastMessageTimestamps = useRef<string[] | null>(null);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const chime = new Audio("/sounds/chime.mp3");
			chime.volume = raceControlChimeVolume / 100;
			chimeRef.current = chime;
			return () => {
				chimeRef.current = null;
			};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (messages === undefined || messages === null) return;
		if (!pastMessageTimestamps.current) {
			pastMessageTimestamps.current = messages.map((msg) => msg.Utc);
			return;
		}
		const newMessages = messages.filter((msg) => !pastMessageTimestamps.current?.includes(msg.Utc));
		if (newMessages.length > 0 && raceControlChime) {
			chimeRef.current?.play();
		}
		pastMessageTimestamps.current = messages.map((msg) => msg.Utc);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [messages]);

	return (
		<ul className="flex flex-col font-mono">
			{!messages &&
				new Array(7).fill("").map((_, index) => <SkeletonMessage key={`msg.loading.${index}`} index={index} />)}

			{messages && gmtOffset && (
				<AnimatePresence>
					{messages
						.sort(sortUtc)
						.filter((msg) => (msg.Flag ? msg.Flag.toLowerCase() !== "blue" : true))
						.map((msg, i) => (
							<RaceControlMessage key={`msg.${i}`} msg={msg} gmtOffset={gmtOffset} />
						))}
				</AnimatePresence>
			)}
		</ul>
	);
}

const SkeletonMessage = ({ index }: { index: number }) => {
	const long = index % 5 === 0;
	const mid = index % 3 === 0;
	return (
		<li className="flex items-baseline gap-[1ch] border-b border-zinc-900 px-2 py-0.5 font-mono text-sm">
			<span className="inline-block h-3 w-14 animate-pulse rounded-sm bg-zinc-800" />
			<span
				className="inline-block h-3 animate-pulse rounded-sm bg-zinc-800"
				style={{ width: long ? "70%" : mid ? "50%" : "35%" }}
			/>
		</li>
	);
};
