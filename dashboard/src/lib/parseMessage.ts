/**
 * Parse an SSE payload and normalise the compressed telemetry topics.
 *
 * The realtime backend forwards the raw F1 topic names (`CarData.z`, `Position.z`),
 * but `useDataEngine` works with `CarDataZ` / `PositionZ`. Accept either so live
 * sessions and recorded replays both get car telemetry + the moving track map.
 */
export const parseMessage = <T>(data: string): T => {
	const msg = JSON.parse(data) as Record<string, unknown>;

	if ("CarData.z" in msg) {
		msg.CarDataZ ??= msg["CarData.z"];
		delete msg["CarData.z"];
	}
	if ("Position.z" in msg) {
		msg.PositionZ ??= msg["Position.z"];
		delete msg["Position.z"];
	}

	return msg as T;
};
