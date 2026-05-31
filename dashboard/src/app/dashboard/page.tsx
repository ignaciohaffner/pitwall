"use client";

import { useState } from "react";
import clsx from "clsx";

import { useDataStore } from "@/stores/useDataStore";

import LeaderBoard from "@/components/dashboard/LeaderBoard";
import QualiLeaderBoard from "@/components/dashboard/QualiLeaderBoard";
import RaceControl from "@/components/dashboard/RaceControl";
import TeamRadios from "@/components/dashboard/TeamRadios";
import TrackViolations from "@/components/dashboard/TrackViolations";
import Footer from "@/components/Footer";

import TyreStrategyPage from "@/app/dashboard/tyre-strategy/page";
import LapTimesPage from "@/app/dashboard/lap-times/page";
import SpeedTrapsPage from "@/app/dashboard/speed-traps/page";
import StandingsPage from "@/app/dashboard/standings/page";
import TrackMapPage from "@/app/dashboard/track-map/page";
import WeatherPage from "@/app/dashboard/weather/page";

type TabId =
	| "timing"
	| "map"
	| "racecontrol"
	| "radios"
	| "violations"
	| "tyres"
	| "laptimes"
	| "speedtraps"
	| "weather"
	| "standings";

const TABS: { id: TabId; label: string }[] = [
	{ id: "timing", label: "Timing" },
	{ id: "map", label: "Map" },
	{ id: "racecontrol", label: "Race Control" },
	{ id: "radios", label: "Radios" },
	{ id: "violations", label: "Violations" },
	{ id: "tyres", label: "Tyres" },
	{ id: "laptimes", label: "Lap Times" },
	{ id: "speedtraps", label: "Speed Traps" },
	{ id: "weather", label: "Weather" },
	{ id: "standings", label: "Standings" },
];

export default function Page() {
	const [activeTab, setActiveTab] = useState<TabId>("timing");
	const sessionName = useDataStore((state) => state.state?.SessionInfo?.Name ?? "");
	const isQuali = sessionName.toLowerCase().includes("qualifying");

	return (
		<div className="flex w-full flex-col">
			{/* Tab bar */}
			<div className="no-scrollbar flex overflow-x-auto border-b border-zinc-700">
				{TABS.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={clsx(
							"shrink-0 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest",
							activeTab === tab.id
								? "bg-zinc-200 text-black"
								: "text-zinc-600 hover:text-zinc-300",
						)}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Tab content */}
			<div className="flex-1">
				{activeTab === "timing" && (
					<div className="w-full">
						{isQuali ? <QualiLeaderBoard /> : <LeaderBoard />}
					</div>
				)}

				{activeTab === "map" && (
					<div className="h-[calc(100vh-12rem)]">
						<TrackMapPage />
					</div>
				)}

				{activeTab === "racecontrol" && (
					<div className="h-[30rem] overflow-y-auto p-2">
						<RaceControl />
					</div>
				)}

				{activeTab === "radios" && (
					<div className="h-[30rem] overflow-y-auto p-2">
						<TeamRadios />
					</div>
				)}

				{activeTab === "violations" && (
					<div className="h-[30rem] overflow-y-auto p-2">
						<TrackViolations />
					</div>
				)}

				{activeTab === "tyres" && (
					<div className="h-[70vh]">
						<TyreStrategyPage />
					</div>
				)}

				{activeTab === "laptimes" && (
					<div className="h-[70vh]">
						<LapTimesPage />
					</div>
				)}

				{activeTab === "speedtraps" && (
					<div className="h-[70vh]">
						<SpeedTrapsPage />
					</div>
				)}

				{activeTab === "weather" && (
					<div className="h-[70vh]">
						<WeatherPage />
					</div>
				)}

				{activeTab === "standings" && (
					<div className="h-[70vh] overflow-auto">
						<StandingsPage />
					</div>
				)}
			</div>

			<Footer />
		</div>
	);
}
