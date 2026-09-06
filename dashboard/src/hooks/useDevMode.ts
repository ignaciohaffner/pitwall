import { useCallback, useEffect, useSyncExternalStore } from "react";

// Dev tooling gate for the replay overlay.
//
//   - development build: ON by default. `localStorage.dev = "0"` (or the overlay's
//     "hide" button) turns it off; `?dev=1` turns it back on.
//   - production build: OFF unless `localStorage.dev = "1"` / `?dev=1`.

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const isDevBuild = process.env.NODE_ENV === "development";

const readDev = (): boolean => {
	try {
		const stored = localStorage.getItem("dev");
		if (stored === "1") return true;
		if (stored === "0") return false;
	} catch {
		/* ignore */
	}
	return isDevBuild;
};

// Apply ?dev=1 / ?dev=0 to localStorage. Runs on mount so client-side navigation
// to a ?dev= URL still takes effect. Returns true when it changed something.
const applyQueryParam = (): boolean => {
	try {
		const param = new URLSearchParams(window.location.search).get("dev");
		const next = param === "1" ? "1" : param === "0" ? "0" : null;
		if (next !== null && localStorage.getItem("dev") !== next) {
			localStorage.setItem("dev", next);
			return true;
		}
	} catch {
		/* ignore */
	}
	return false;
};

if (typeof window !== "undefined") {
	window.addEventListener("storage", emit);
}

export const useDevMode = () => {
	const active = useSyncExternalStore(
		(cb) => {
			listeners.add(cb);
			return () => listeners.delete(cb);
		},
		readDev,
		() => isDevBuild,
	);

	useEffect(() => {
		if (applyQueryParam()) emit();
	}, []);

	const disable = useCallback(() => {
		try {
			localStorage.setItem("dev", "0");
		} catch {
			/* ignore */
		}
		emit();
	}, []);

	return { active, disable };
};
