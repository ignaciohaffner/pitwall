export type NewKeys = {
	/** Keys present at the first non-empty list, or added since; null until the list has items. */
	seen: Set<string> | null;
	/** Keys that arrived after that first list: the ones to animate. */
	fresh: Set<string>;
};

export const initialNewKeys = (): NewKeys => ({ seen: null, fresh: new Set() });

/**
 * Track which keys of a list arrived while it was on screen. The first non-empty list is the
 * baseline (what was there on load); an empty list starts over (new session). Returns `state`
 * itself when nothing changed, so it can drive a setState during render.
 */
export function trackNewKeys(state: NewKeys, keys: string[]): NewKeys {
	if (keys.length === 0) return state.seen === null ? state : initialNewKeys();
	if (state.seen === null) return { seen: new Set(keys), fresh: new Set() };

	const added = keys.filter((key) => !state.seen!.has(key));
	if (added.length === 0) return state;
	return { seen: new Set(Array.from(state.seen).concat(added)), fresh: new Set(Array.from(state.fresh).concat(added)) };
}
