"use client";

import Link from "next/link";
import clsx from "clsx";

import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { sortPos } from "@/lib/sorting";

function convertToMph(kmh: string): string {
	const n = parseInt(kmh);
	return isNaN(n) ? "—" : String(Math.floor(n / 1.609344));
}

import type { PersonalBestLapTime } from "@/types/state.type";

const SpeedVal = ({ cell, unit }: { cell: PersonalBestLapTime | undefined; unit: string }) => {
	if (!cell?.Value) return <span className="text-zinc-700">—</span>;
	const display = unit === "metric" ? cell.Value : convertToMph(cell.Value);
	return (
		<span
			className={clsx("font-mono font-medium tabular-nums", {
				"text-violet-400": cell.Position === 1,
				"text-zinc-300": cell.Position !== 1,
			})}
		>
			{display}
		</span>
	);
};

export default function SpeedTraps() {
	const timingStats = useDataStore((s) => s.state?.TimingStats?.Lines);
	const driverList = useDataStore((s) => s.state?.DriverList);
	const timingData = useDataStore((s) => s.state?.TimingData?.Lines);
	const speedUnit = useSettingsStore((s) => s.speedUnit);

	const unit = speedUnit === "metric" ? "km/h" : "mp/h";

	if (!timingStats || !driverList || !timingData) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<p className="text-zinc-500">waiting for session data...</p>
			</div>
		);
	}

	const drivers = Object.values(timingData)
		.filter((d) => driverList[d.RacingNumber])
		.sort(sortPos);

	return (
		<div className="flex h-full w-full flex-col p-4">
			<h2 className="mb-4 text-lg font-semibold">Speed Traps</h2>

			<div className="no-scrollbar overflow-auto rounded-lg border border-zinc-800">
				<table className="w-full text-sm">
					<thead className="sticky top-0 bg-zinc-950">
						<tr className="text-left text-xs text-zinc-500">
							<th className="p-2">P</th>
							<th className="p-2">Driver</th>
							<th className="p-2 text-right">
								I1
								<span className="ml-1 text-zinc-700">{unit}</span>
							</th>
							<th className="p-2 text-right">
								I2
								<span className="ml-1 text-zinc-700">{unit}</span>
							</th>
							<th className="p-2 text-right">
								FL
								<span className="ml-1 text-zinc-700">{unit}</span>
							</th>
							<th className="p-2 text-right">
								ST
								<span className="ml-1 text-zinc-700">{unit}</span>
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-zinc-800/50">
						{drivers.map((td, i) => {
							const driver = driverList[td.RacingNumber];
							const stats = timingStats[td.RacingNumber];
							return (
								<tr key={td.RacingNumber} className="hover:bg-zinc-900/50">
									<td className="p-2 text-xs text-zinc-500">{i + 1}</td>
									<td className="p-2">
										<Link
											href={`/dashboard/driver/${td.RacingNumber}`}
											className="flex items-center gap-2 hover:underline"
										>
											<span
												className="inline-block h-3 w-1 rounded-full"
												style={{ backgroundColor: `#${driver.TeamColour}` }}
											/>
											<span className="font-bold" style={{ color: `#${driver.TeamColour}` }}>
												{driver.Tla}
											</span>
										</Link>
									</td>
									<td className="p-2 text-right">
										<SpeedVal cell={stats?.BestSpeeds?.I1} unit={unit} />
									</td>
									<td className="p-2 text-right">
										<SpeedVal cell={stats?.BestSpeeds?.I2} unit={unit} />
									</td>
									<td className="p-2 text-right">
										<SpeedVal cell={stats?.BestSpeeds?.Fl} unit={unit} />
									</td>
									<td className="p-2 text-right">
										<SpeedVal cell={stats?.BestSpeeds?.St} unit={unit} />
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
