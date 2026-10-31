import { useState } from "react";

import { initialNewKeys, trackNewKeys } from "@/lib/newKeys";

/** The keys that showed up after the list first had items (see trackNewKeys). */
export const useNewKeys = (keys: string[]): Set<string> => {
	const [state, setState] = useState(initialNewKeys);
	// Derived during render, as in usePositionFlash, so a new item animates from its first frame.
	const next = trackNewKeys(state, keys);
	if (next !== state) setState(next);
	return next.fresh;
};
