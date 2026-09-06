import Image from "next/image";

import Note from "@/components/Note";
import DriverDRS from "@/components/driver/DriverDRS";
import DriverTire from "@/components/driver/DriverTire";
import DriverPedals from "@/components/driver/DriverPedals";
import TemperatureComplication from "@/components/complications/Temperature";
import HumidityComplication from "@/components/complications/Humidity";
import WindSpeedComplication from "@/components/complications/WindSpeed";
import RainComplication from "@/components/complications/Rain";

import unknownTireIcon from "public/tires/unknown.svg";
import mediumTireIcon from "public/tires/medium.svg";
import interTireIcon from "public/tires/intermediate.svg";
import hardTireIcon from "public/tires/hard.svg";
import softTireIcon from "public/tires/soft.svg";
import wetTireIcon from "public/tires/wet.svg";

export default function HelpPage() {
	return (
		<div className="font-mono">
			<div className="my-4 border-b border-zinc-800 pb-1">
				<p className="text-[11px] tracking-widest text-zinc-300 uppercase">{">"} help</p>
				<p className="text-[10px] text-zinc-600">pitwall ui reference</p>
			</div>

			<p className="mb-6 text-sm text-zinc-400">this page explains core features and ui elements of pitwall.</p>

			<SectionHeader label="colors" />

			<p className="mb-4 text-sm text-zinc-400">
				color-coding is used for lap times, sector times, mini sectors, and gaps. each color has a specific meaning.
			</p>

			<div className="mb-4 flex flex-col gap-1 text-sm">
				<div className="flex items-center gap-[2ch]">
					<span className="text-zinc-300">■</span>
					<span className="text-zinc-500">white</span>
					<span className="text-zinc-600">—</span>
					<span className="text-zinc-400">last lap time</span>
				</div>
				<div className="flex items-center gap-[2ch]">
					<span className="text-amber-400">■</span>
					<span className="text-zinc-500">yellow</span>
					<span className="text-zinc-600">—</span>
					<span className="text-zinc-400">slower than personal best</span>
				</div>
				<div className="flex items-center gap-[2ch]">
					<span className="text-emerald-500">■</span>
					<span className="text-zinc-500">green</span>
					<span className="text-zinc-600">—</span>
					<span className="text-zinc-400">personal best</span>
				</div>
				<div className="flex items-center gap-[2ch]">
					<span className="text-violet-500">■</span>
					<span className="text-zinc-500">purple</span>
					<span className="text-zinc-600">—</span>
					<span className="text-zinc-400">overall best</span>
				</div>
				<div className="flex items-center gap-[2ch]">
					<span className="text-blue-500">■</span>
					<span className="text-zinc-500">blue</span>
					<span className="text-zinc-600">—</span>
					<span className="text-zinc-400">driver in the pit lane</span>
				</div>
			</div>

			<Note className="mb-6">
				only mini sectors use the yellow color. using yellow for all drivers not improving their lap times would make
				the ui look cluttered, as many text elements would be yellow simultaneously.
			</Note>

			<SectionHeader label="leaderboard" />

			<p className="mb-4 text-sm text-zinc-400">
				the leaderboard shows all drivers of the ongoing session. driver row backgrounds indicate status.
			</p>

			<div className="mb-6 flex flex-col gap-2 text-sm">
				<div className="flex items-center gap-[2ch]">
					<span className="inline-block w-3 rounded-sm bg-violet-800/30 px-2 py-1 text-zinc-300">▌</span>
					<span className="text-zinc-400">purple background — driver has the fastest overall lap time</span>
				</div>
				<div className="flex items-center gap-[2ch]">
					<span className="inline-block text-zinc-400 opacity-50">░░░</span>
					<span className="text-zinc-400">transparent — driver has crashed or retired from the session</span>
				</div>
				<div className="flex items-center gap-[2ch]">
					<span className="inline-block w-3 rounded-sm bg-red-800/30 px-2 py-1 text-zinc-300">▌</span>
					<span className="text-zinc-400">red background — driver is in the danger zone during qualifying</span>
				</div>
			</div>

			<SectionHeader label="drs & pit status" />

			<p className="mb-4 text-sm text-zinc-400">
				each driver has a drs and pit status indicator showing overtake potential and pit activity.
			</p>

			<div className="mb-6 flex flex-col gap-4">
				<div className="flex items-center gap-[2ch]">
					<div className="w-[4rem]">
						<DriverDRS on={false} possible={false} inPit={false} pitOut={false} />
					</div>
					<p className="text-sm text-zinc-400">off — no drs (default)</p>
				</div>
				<div className="flex items-center gap-[2ch]">
					<div className="w-[4rem]">
						<DriverDRS on={false} possible={true} inPit={false} pitOut={false} />
					</div>
					<p className="text-sm text-zinc-400">possible — eligible for drs in the next zone</p>
				</div>
				<div className="flex items-center gap-[2ch]">
					<div className="w-[4rem]">
						<DriverDRS on={true} possible={false} inPit={false} pitOut={false} />
					</div>
					<p className="text-sm text-zinc-400">active — drs is active</p>
				</div>
				<div className="flex items-center gap-[2ch]">
					<div className="w-[4rem]">
						<DriverDRS on={false} possible={false} inPit={true} pitOut={false} />
					</div>
					<p className="text-sm text-zinc-400">pit — in the pit lane or leaving</p>
				</div>
			</div>

			<SectionHeader label="tires" />

			<p className="mb-4 text-sm text-zinc-400">
				shows current tire compound and lap age. example: soft tire, 12 laps old, one pit stop.
			</p>

			<div className="mb-4">
				<DriverTire
					stints={[
						{ TotalLaps: 12, Compound: "SOFT" },
						{ TotalLaps: 12, Compound: "SOFT", New: "TRUE" },
					]}
				/>
			</div>

			<p className="mb-4 text-sm text-zinc-400">tire compounds:</p>

			<div className="mb-4 flex flex-wrap gap-[2ch]">
				<div className="flex items-center gap-[1ch]">
					<Image src={softTireIcon} alt="soft" className="size-6" />
					<span className="text-xs text-zinc-500">soft</span>
				</div>
				<div className="flex items-center gap-[1ch]">
					<Image src={mediumTireIcon} alt="medium" className="size-6" />
					<span className="text-xs text-zinc-500">medium</span>
				</div>
				<div className="flex items-center gap-[1ch]">
					<Image src={hardTireIcon} alt="hard" className="size-6" />
					<span className="text-xs text-zinc-500">hard</span>
				</div>
				<div className="flex items-center gap-[1ch]">
					<Image src={interTireIcon} alt="intermediate" className="size-6" />
					<span className="text-xs text-zinc-500">inter</span>
				</div>
				<div className="flex items-center gap-[1ch]">
					<Image src={wetTireIcon} alt="wet" className="size-6" />
					<span className="text-xs text-zinc-500">wet</span>
				</div>
				<div className="flex items-center gap-[1ch]">
					<Image src={unknownTireIcon} alt="unknown" className="size-6" />
					<span className="text-xs text-zinc-500">unknown</span>
				</div>
			</div>

			<Note className="mb-6">
				sometimes the tire type is unknown. this can happen at the beginning of a session or when something goes wrong.
			</Note>

			<SectionHeader label="delay control" />

			<p className="mb-4 text-sm text-zinc-400">
				pitwall updates faster than most streams. use the delay control to sync pitwall with your broadcast — a 30s
				delay will hold updates until 30 seconds after they arrive.
			</p>

			<Note className="mb-4">
				you can only set a delay up to the time you have been on the dashboard page. so 30s delay on a 20s visit means
				you wait 10s until playback resumes. (this will change in a future update)
			</Note>

			<p className="mb-2 text-[11px] tracking-widest text-zinc-500 uppercase">what to look for when syncing</p>

			<ul className="mb-6 flex flex-col gap-1 text-sm text-zinc-400">
				<li className="flex items-center gap-[1ch]">
					<span className="text-zinc-600">—</span>
					start of a new lap <span className="ml-1 text-zinc-600">(race)</span>
				</li>
				<li className="flex items-center gap-[1ch]">
					<span className="text-zinc-600">—</span>
					session clock <span className="ml-1 text-zinc-600">(practice, qualifying)</span>
				</li>
				<li className="flex items-center gap-[1ch]">
					<span className="text-zinc-600">—</span>
					mini sectors if available
				</li>
			</ul>

			<SectionHeader label="driver pedals" />

			<div className="mb-6 flex flex-col gap-4">
				<div className="flex items-center gap-[2ch]">
					<div className="w-[4rem]">
						<DriverPedals className="bg-red-500" value={1} maxValue={3} />
					</div>
					<p className="text-sm text-zinc-400">
						braking <span className="text-zinc-600">(on / off)</span>
					</p>
				</div>
				<div className="flex items-center gap-[2ch]">
					<div className="w-[4rem]">
						<DriverPedals className="bg-emerald-500" value={3} maxValue={4} />
					</div>
					<p className="text-sm text-zinc-400">
						throttle <span className="text-zinc-600">(0–100%)</span>
					</p>
				</div>
				<div className="flex items-center gap-[2ch]">
					<div className="w-[4rem]">
						<DriverPedals className="bg-blue-500" value={2} maxValue={3} />
					</div>
					<p className="text-sm text-zinc-400">
						engine rpm <span className="text-zinc-600">(0–15,000)</span>
					</p>
				</div>
			</div>

			<SectionHeader label="weather" />

			<div className="mb-8 flex flex-col gap-3">
				<div className="flex items-center gap-[2ch]">
					<TemperatureComplication value={39} label="TRC" />
					<p className="text-sm text-zinc-400">track temperature</p>
				</div>
				<div className="flex items-center gap-[2ch]">
					<TemperatureComplication value={26} label="AIR" />
					<p className="text-sm text-zinc-400">air temperature</p>
				</div>
				<div className="flex items-center gap-[2ch]">
					<HumidityComplication value={36} />
					<p className="text-sm text-zinc-400">humidity</p>
				</div>
				<div className="flex items-center gap-[2ch]">
					<RainComplication rain={true} />
					<p className="text-sm text-zinc-400">rain indicator</p>
				</div>
				<div className="flex items-center gap-[2ch]">
					<WindSpeedComplication speed={2.9} directionDeg={250} />
					<p className="text-sm text-zinc-400">wind speed (m/s) and cardinal direction</p>
				</div>
			</div>
		</div>
	);
}

function SectionHeader({ label }: { label: string }) {
	return (
		<div className="mb-3 border-b border-zinc-800 pb-1">
			<p className="text-[11px] tracking-widest text-zinc-500 uppercase">{label}</p>
		</div>
	);
}
