"use client";

import { useEffect, useState } from "react";

import type { Driver } from "@/types/state.type";

import { env } from "@/env";
import { useSettingsStore } from "@/stores/useSettingsStore";

import DriverTag from "@/components/driver/DriverTag";
import SelectMultiple from "@/components/ui/SelectMultiple";

export default function FavoriteDrivers() {
	const [drivers, setDrivers] = useState<Driver[] | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [error, setError] = useState<string | null>(null);

	const { favoriteDrivers, setFavoriteDrivers, removeFavoriteDriver } = useSettingsStore();

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(`${env.NEXT_PUBLIC_LIVE_URL}/api/drivers`);
				const data = await res.json();
				setDrivers(data);
			} catch {
				setError("failed to fetch favorite drivers");
			}
		})();
	}, []);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap gap-[1.5ch]">
				{favoriteDrivers.map((driverNumber) => {
					const driver = drivers?.find((d) => d.RacingNumber === driverNumber);
					if (!driver) return null;

					return (
						<div key={driverNumber} className="flex items-center gap-[1ch] border border-zinc-800 px-2 py-1">
							<DriverTag teamColor={driver.TeamColour} short={driver.Tla} />
							<button
								onClick={() => removeFavoriteDriver(driverNumber)}
								className="cursor-pointer font-mono text-xs text-zinc-600 transition-colors hover:text-zinc-300"
							>
								✕
							</button>
						</div>
					);
				})}
			</div>

			<div className="w-80">
				<SelectMultiple
					placeholder="select favorite drivers"
					options={drivers ? drivers.map((d) => ({ label: d.FullName, value: d.RacingNumber })) : []}
					selected={favoriteDrivers}
					setSelected={setFavoriteDrivers}
				/>
			</div>
		</div>
	);
}
