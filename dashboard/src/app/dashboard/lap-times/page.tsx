"use client";

import { useState } from "react";
import clsx from "clsx";

import { useDataStore } from "@/stores/useDataStore";
import { useHistoryStore } from "@/stores/useHistoryStore";

export default function LapTimes() {
	const driverList = useDataStore((s) => s.state?.DriverList);
	const currentLap = useDataStore((s) => s.state?.LapCount?.CurrentLap ?? 0);
	const timingLines = useDataStore((s) => s.state?.TimingData?.Lines);
	const lapTimes = useHistoryStore((s) => s.lapTimes);

	const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(new Set());
	const [showPicker, setShowPicker] = useState(false);

	if (!driverList) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<p className="text-zinc-500">waiting for session data...</p>
			</div>
		);
	}

	const allDrivers = Object.values(driverList).sort((a, b) => {
		const posA = parseInt(timingLines?.[a.RacingNumber]?.Position ?? "99");
		const posB = parseInt(timingLines?.[b.RacingNumber]?.Position ?? "99");
		return posA - posB;
	});

	const visibleDrivers =
		selectedDrivers.size > 0 ? allDrivers.filter((d) => selectedDrivers.has(d.RacingNumber)) : allDrivers.slice(0, 5);

	const laps = Array.from({ length: currentLap }, (_, i) => currentLap - i);

	const toggleDriver = (nr: string) => {
		setSelectedDrivers((prev) => {
			const next = new Set(prev);
			next.has(nr) ? next.delete(nr) : next.add(nr);
			return next;
		});
	};

	const selectAll = () => setSelectedDrivers(new Set(allDrivers.map((d) => d.RacingNumber)));
	const selectNone = () => setSelectedDrivers(new Set());

	return (
		<div className="flex h-full w-full flex-col p-4">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold">Lap Times</h2>
				<button
					onClick={() => setShowPicker((v) => !v)}
					className="rounded-lg border border-zinc-700 px-3 py-1 text-sm hover:bg-zinc-800"
				>
					Drivers ({visibleDrivers.length})
				</button>
			</div>

			{/* Driver picker */}
			{showPicker && (
				<div className="mb-4 rounded-lg border border-zinc-700 bg-zinc-900 p-3">
					<div className="mb-2 flex gap-2">
						<button onClick={selectAll} className="rounded bg-zinc-700 px-2 py-0.5 text-xs hover:bg-zinc-600">
							ALL
						</button>
						<button onClick={selectNone} className="rounded bg-zinc-700 px-2 py-0.5 text-xs hover:bg-zinc-600">
							NONE
						</button>
					</div>
					<div className="flex flex-wrap gap-2">
						{allDrivers.map((d) => {
							const selected = selectedDrivers.size === 0 ? visibleDrivers.includes(d) : selectedDrivers.has(d.RacingNumber);
							return (
								<button
									key={d.RacingNumber}
									onClick={() => toggleDriver(d.RacingNumber)}
									className={clsx("rounded px-2 py-0.5 text-xs font-bold transition-opacity", {
										"opacity-40": !selected,
									})}
									style={{ backgroundColor: `#${d.TeamColour}`, color: isLight(d.TeamColour) ? "#000" : "#fff" }}
								>
									{d.Tla}
								</button>
							);
						})}
					</div>
					<button
						onClick={() => setShowPicker(false)}
						className="mt-3 w-full rounded bg-zinc-700 py-1 text-xs hover:bg-zinc-600"
					>
						DONE
					</button>
				</div>
			)}

			{/* Table */}
			{currentLap === 0 ? (
				<div className="flex flex-1 items-center justify-center">
					<p className="text-zinc-500">no laps completed yet</p>
				</div>
			) : (
				<div className="no-scrollbar overflow-auto rounded-lg border border-zinc-800">
					<table className="w-full text-sm">
						<thead className="sticky top-0 bg-zinc-950">
							<tr>
								<th className="p-2 text-left text-xs text-zinc-500">LAP</th>
								{visibleDrivers.map((d) => (
									<th
										key={d.RacingNumber}
										className="p-2 text-right text-xs font-bold"
										style={{ color: `#${d.TeamColour}` }}
									>
										{d.Tla}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-800/50">
							{laps.map((lap) => (
								<tr key={lap} className="hover:bg-zinc-900/50">
									<td className="p-2 text-xs text-zinc-500">{lap}</td>
									{visibleDrivers.map((d) => {
										const entry = lapTimes[d.RacingNumber]?.find((e) => e.lap === lap);
										return (
											<td key={d.RacingNumber} className="p-2 text-right font-mono text-xs">
												{entry ? (
													<span
														className={clsx({
															"text-purple-400": entry.overallFastest,
															"text-green-400": !entry.overallFastest && entry.personalFastest,
															"text-zinc-300": !entry.overallFastest && !entry.personalFastest,
														})}
													>
														{entry.time}
													</span>
												) : (
													<span className="text-zinc-700">—</span>
												)}
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

function isLight(hex: string | undefined): boolean {
	if (!hex || hex.length < 6) return false;
	const r = parseInt(hex.slice(0, 2), 16);
	const g = parseInt(hex.slice(2, 4), 16);
	const b = parseInt(hex.slice(4, 6), 16);
	return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
