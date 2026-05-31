export const parseTimeMs = (timeStr: string): number => {
	if (!timeStr) return Infinity;
	const colonIdx = timeStr.indexOf(":");
	if (colonIdx !== -1) {
		const minutes = parseInt(timeStr.slice(0, colonIdx));
		const seconds = parseFloat(timeStr.slice(colonIdx + 1));
		return minutes * 60000 + Math.round(seconds * 1000);
	}
	return Math.round(parseFloat(timeStr) * 1000);
};

export const formatDelta = (deltaMs: number): string => {
	if (!isFinite(deltaMs) || deltaMs === 0) return "";
	const sign = deltaMs > 0 ? "+" : "-";
	const abs = Math.abs(deltaMs) / 1000;
	return `${sign}${abs.toFixed(3)}`;
};
