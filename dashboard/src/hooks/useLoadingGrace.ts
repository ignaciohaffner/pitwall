import { useEffect, useState } from "react";

/**
 * True once `ms` has passed since mount. Use it to stop showing skeletons forever
 * when a feed topic never arrives (e.g. between sessions).
 */
export const useLoadingGrace = (ms = 10_000): boolean => {
	const [elapsed, setElapsed] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setElapsed(true), ms);
		return () => clearTimeout(t);
	}, [ms]);

	return elapsed;
};
