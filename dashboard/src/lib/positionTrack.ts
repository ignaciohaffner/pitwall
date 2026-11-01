import type { PositionCar, Positions } from "@/types/state.type";

// Smooth car positions for the track map.
//
// F1 sends position samples in irregular batches. Drawing the "latest" sample makes the
// dots jump/stall, so every timed sample is kept here and the map reads an interpolated
// position at a playhead that trails the newest sample by SMOOTH_MS. Having a "next"
// sample ahead of the playhead is what lets us interpolate instead of guessing.

// How far behind the newest sample we draw. Bigger = smoother when batches are uneven.
const SMOOTH_MS = 1500;
// Playhead catch-up gain (1/s). Low on purpose: a high gain makes the dots speed up and
// slow down every time a batch lands.
const CATCH_UP = 0.5;
// Gap between playhead and target above which we just jump (replay seek, tab sleeping).
const SNAP_MS = 10_000;
// Never advance the playhead by more than this per frame (background tab resumes).
const MAX_FRAME_MS = 100;
// Samples older than newest - (delay + this) are dropped.
const KEEP_MS = 15_000;

type Sample = { t: number; cars: Positions };

let samples: Sample[] = [];
let playhead: number | null = null;
let lastFrame: number | null = null;
let keepMs = KEEP_MS;

export const pushPositionSample = (t: number, cars: Positions) => {
	if (!Number.isFinite(t) || t < 0) return;

	const last = samples[samples.length - 1];
	if (last && t === last.t) {
		samples[samples.length - 1] = { t, cars };
		return;
	}

	samples.push({ t, cars });
	if (last && t < last.t) samples.sort((a, b) => a.t - b.t);

	const threshold = samples[samples.length - 1].t - keepMs;
	let drop = 0;
	// keep one sample at/before the threshold so interpolation still has a left edge
	while (drop + 1 < samples.length && samples[drop + 1].t <= threshold) drop++;
	if (drop > 0) samples = samples.slice(drop);
};

export const resetPositionTrack = () => {
	samples = [];
	playhead = null;
	lastFrame = null;
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const blend = (a: PositionCar | undefined, b: PositionCar | undefined, k: number): PositionCar | undefined => {
	if (!a) return b;
	if (!b) return a;
	return { Status: a.Status, X: lerp(a.X, b.X, k), Y: lerp(a.Y, b.Y, k), Z: lerp(a.Z, b.Z, k) };
};

/**
 * Positions of every car at the current playhead, or null if there isn't enough data
 * yet (caller falls back to the stepped positions).
 *
 * @param now     monotonic ms (performance.now()), called once per animation frame
 * @param delayMs the user's broadcast delay setting, in ms
 * @param speed   playback speed of the source (1 live, replay speed otherwise)
 */
export const getSmoothedPositions = (now: number, delayMs: number, speed: number): Positions | null => {
	keepMs = KEEP_MS + delayMs;
	if (samples.length < 2) return null;

	const newest = samples[samples.length - 1].t;
	const target = newest - delayMs - SMOOTH_MS;

	if (playhead === null || lastFrame === null || Math.abs(target - playhead) > SNAP_MS) {
		playhead = target;
	} else {
		const dt = Math.min(now - lastFrame, MAX_FRAME_MS);
		const lagSecs = (target - playhead) / 1000;
		playhead += dt * Math.max(0, speed + CATCH_UP * lagSecs);
	}
	lastFrame = now;

	// never run past the data we have (replay paused, feed stalled): hold still
	playhead = Math.min(playhead, newest);

	const first = samples[0];
	if (playhead <= first.t) return first.cars;

	// binary search: last sample with t <= playhead
	let lo = 0;
	let hi = samples.length - 1;
	while (lo < hi) {
		const mid = (lo + hi + 1) >> 1;
		if (samples[mid].t <= playhead) lo = mid;
		else hi = mid - 1;
	}

	const a = samples[lo];
	const b = samples[lo + 1];
	if (!b) return a.cars;

	const k = (playhead - a.t) / (b.t - a.t);
	const out: Positions = {};
	for (const nr of Object.keys(b.cars)) {
		const p = blend(a.cars[nr], b.cars[nr], k);
		if (p) out[nr] = p;
	}
	return out;
};
