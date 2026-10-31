import { create } from "zustand";

import type { CarsData, Positions, State } from "@/types/state.type";

import { teamColours } from "@/lib/color";
import { timingAppStints } from "@/lib/stintFolding";
import { previousBestSectors, type BestSectors } from "@/lib/pushLap";
import { scheduleSessionFix, synthesizeTimingData } from "@/lib/timingFallback";
import type { Round } from "@/types/schedule.type";

// main store

export type DataStore = {
	state: State | null;
	carsData: CarsData | null;
	positions: Positions | null;
	/** Per driver, the best sectors before their latest improvement (see previousBestSectors). */
	previousBests: BestSectors;
	/** The live meeting from the schedule, to correct a SessionInfo naming the wrong session. Null in replay. */
	liveRound: Round | null;

	setState: (state: Partial<State> | null) => void;
	setCarsData: (carsData: CarsData | null) => void;
	setPositions: (positions: Positions | null) => void;
	setLiveRound: (round: Round | null) => void;
};

export const useDataStore = create<DataStore>((set) => ({
	state: null,
	carsData: null,
	positions: null,
	previousBests: {},
	liveRound: null,

	setState: (partialState: Partial<State> | null) =>
		set((prev) => {
			if (partialState?.DriverList)
				partialState = { ...partialState, DriverList: teamColours(partialState.DriverList) };
			if (partialState?.TimingAppData)
				partialState = { ...partialState, TimingAppData: timingAppStints(partialState.TimingAppData) };
			const previousBests = partialState
				? previousBestSectors(prev.state?.TimingStats, partialState.TimingStats, prev.previousBests)
				: {};
			const state: State | null = partialState
				? {
						...(prev.state ?? {}),
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						...Object.fromEntries(Object.entries(partialState).filter(([_, v]) => v !== undefined)),
					}
				: null;
			if (state) {
				// A synthetic TimingData is rebuilt every time, never merged into the next frame.
				if (state.TimingData?.Synthetic && !partialState?.TimingData) state.TimingData = undefined;
				const synthetic = synthesizeTimingData(state);
				if (synthetic) state.TimingData = synthetic;
				const fixedSession = scheduleSessionFix(state.SessionInfo, prev.liveRound, Date.now());
				if (fixedSession) state.SessionInfo = fixedSession;
			}
			return { previousBests, state };
		}),
	setLiveRound: (liveRound: Round | null) => set({ liveRound }),
	setCarsData: (carsData: CarsData | null) => set({ carsData }),
	setPositions: (positions: Positions | null) => set({ positions }),
}));
