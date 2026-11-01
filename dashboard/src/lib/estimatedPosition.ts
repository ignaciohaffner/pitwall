import type { TimingDataDriver } from "@/types/state.type";

// Car position along the lap when F1 sends no GPS (the anonymous live feed has no
// Position.z / CarData.z): dead reckoning on the minisector progress.
//
// A minisector with status > 0 means the car has completed it. At that moment the car is
// exactly on the boundary. Until the next one completes we advance it at the pace of the
// last minisectors, never past the next boundary, so it glides instead of stepping 1/22
// of the lap at a time.

const DEFAULT_SEG_MS = 4000;
const MIN_SEG_MS = 800;
const MAX_SEG_MS = 20_000;
// weight of the newest minisector time in the running pace
const PACE_EMA = 0.35;
// how far into the next minisector we may predict while waiting for F1 to confirm it
const MAX_LEAD = 0.98;
// time constant of the smoothing towards the predicted progress
const SMOOTH_TAU_MS = 350;
const MAX_FRAME_MS = 100;
// a drop in the furthest completed minisector bigger than this is a new lap
const LAP_DROP = 3;

type CarEstimate = {
	furthest: number;
	laps: number;
	eventAt: number;
	segMs: number;
	shown: number | null;
	frameAt: number;
};

const cars = new globalThis.Map<string, CarEstimate>();

export const resetEstimates = () => cars.clear();

const furthestDone = (driver: TimingDataDriver) => {
	let furthest = -1;
	let count = 0;
	for (const sector of driver.Sectors ?? []) {
		for (const segment of sector.Segments ?? []) {
			if ((segment.Status ?? 0) > 0) furthest = count;
			count++;
		}
	}
	return { furthest, count };
};

/** Fraction of the lap in [0, 1) for a car, or null when there is nothing to go on. */
export const estimateLapFraction = (nr: string, driver: TimingDataDriver, now: number): number | null => {
	const { furthest, count } = furthestDone(driver);
	if (count === 0) return null;

	let car = cars.get(nr);
	if (!car) {
		car = { furthest, laps: 0, eventAt: now, segMs: DEFAULT_SEG_MS, shown: null, frameAt: now };
		cars.set(nr, car);
	} else if (furthest !== car.furthest) {
		if (furthest < car.furthest - LAP_DROP) {
			car.laps++;
		} else if (furthest > car.furthest) {
			const ms = (now - car.eventAt) / (furthest - car.furthest);
			if (ms >= MIN_SEG_MS && ms <= MAX_SEG_MS) car.segMs = car.segMs * (1 - PACE_EMA) + ms * PACE_EMA;
		}
		car.furthest = furthest;
		car.eventAt = now;
	}

	// progress in minisectors since the start of the first lap we saw
	const boundary = car.laps * count + car.furthest + 1;
	const lead = driver.InPit ? 0 : Math.min(Math.max((now - car.eventAt) / car.segMs, 0), MAX_LEAD);
	const target = boundary + lead;

	if (car.shown === null || Math.abs(target - car.shown) > count / 2) {
		car.shown = target;
	} else {
		const dt = Math.min(now - car.frameAt, MAX_FRAME_MS);
		const next = car.shown + (target - car.shown) * (1 - Math.exp(-dt / SMOOTH_TAU_MS));
		car.shown = Math.max(car.shown, next); // never backwards
	}
	car.frameAt = now;

	return (((car.shown % count) + count) % count) / count;
};

type Point = { x: number; y: number };

const lengthsCache = new WeakMap<Point[], number[]>();

const cumulativeLengths = (points: Point[]) => {
	let lengths = lengthsCache.get(points);
	if (!lengths) {
		lengths = [0];
		for (let i = 1; i < points.length; i++) {
			lengths.push(lengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
		}
		lengthsCache.set(points, lengths);
	}
	return lengths;
};

/** Point at a fraction of the track's length (minisectors are about equally long). */
export const pointAtFraction = (points: Point[], fraction: number): Point => {
	if (points.length < 2) return points[0];

	const lengths = cumulativeLengths(points);
	const wanted = fraction * lengths[lengths.length - 1];

	let lo = 0;
	let hi = lengths.length - 1;
	while (lo < hi) {
		const mid = (lo + hi + 1) >> 1;
		if (lengths[mid] <= wanted) lo = mid;
		else hi = mid - 1;
	}

	const a = points[lo];
	const b = points[Math.min(lo + 1, points.length - 1)];
	const span = lengths[Math.min(lo + 1, lengths.length - 1)] - lengths[lo];
	const k = span > 0 ? (wanted - lengths[lo]) / span : 0;
	return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
};
