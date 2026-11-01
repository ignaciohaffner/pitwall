import type { PositionCar, Positions } from "@/types/state.type";

// Smooth car positions for the track map.
//
// F1 sends position samples in ~1s batches (~4 samples each) and a batch is sometimes
// late. Drawing the "latest" sample makes the dots jump/stall, so every timed sample is
// kept here and the map reads an interpolated position at a playhead that trails the
// newest sample. The playhead runs freely at the source speed; a slow controller only
// nudges its rate so the gap to the newest sample ("lead") stays around `bufferMs`.
// If a batch is so late that the playhead runs out of data, the buffer grows.

// Starting / minimum lead. Bigger = smoother when batches are uneven, but more lag.
const MIN_BUFFER_MS = 1500;
const MAX_BUFFER_MS = 4500;
// On an underrun, how much the buffer grows; it shrinks back at SHRINK_PER_SEC.
const GROW_MS = 400;
const SHRINK_PER_SEC = 5;
// Rate nudge per second of lead error, capped so speed changes stay invisible.
const RATE_GAIN = 0.15;
const RATE_CAP = 0.15;
// The worst lead of the last few seconds is what decides stalls: relax over this window.
const LEAD_WINDOW_MS = 8000;
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
let bufferMs = MIN_BUFFER_MS;
let minLead = MIN_BUFFER_MS;
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
	bufferMs = MIN_BUFFER_MS;
	minLead = MIN_BUFFER_MS;
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
	// newest sample the user is allowed to see (their broadcast delay setting)
	const limit = newest - delayMs;

	if (playhead === null || lastFrame === null || Math.abs(limit - playhead - bufferMs) > SNAP_MS) {
		playhead = limit - bufferMs - 500;
		minLead = bufferMs + 500;
		lastFrame = now;
	}

	const dt = Math.min(now - lastFrame, MAX_FRAME_MS);
	lastFrame = now;

	// controller: keep the worst recent lead near bufferMs by speeding up / slowing down a bit
	const errSecs = (minLead - bufferMs) / 1000;
	const nudge = Math.max(-RATE_CAP, Math.min(RATE_CAP, RATE_GAIN * errSecs));
	playhead += dt * speed * (1 + nudge);

	const lead = limit - playhead;
	if (lead < minLead) minLead = lead;
	else minLead += ((lead - minLead) * dt) / LEAD_WINDOW_MS;

	if (lead < 0) {
		// ran out of data: hold at the edge and keep a bigger cushion from now on
		playhead = limit;
		minLead = 0;
		bufferMs = Math.min(MAX_BUFFER_MS, bufferMs + GROW_MS);
	} else {
		bufferMs = Math.max(MIN_BUFFER_MS, bufferMs - (SHRINK_PER_SEC * dt) / 1000);
	}

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
