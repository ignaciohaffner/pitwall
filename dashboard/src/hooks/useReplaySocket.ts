import { useEffect, useRef } from "react";

import type { MessageInitial, MessageUpdate } from "@/types/message.type";

import { useReplayStore } from "@/stores/useReplayStore";
import { parseMessage } from "@/lib/parseMessage";

type Props = {
	handleInitial: (data: MessageInitial) => void;
	handleUpdate: (data: MessageUpdate) => void;
};

type Options = {
	enabled: boolean;
};

// Dev-only mirror of useSocket that streams a recorded session from /api/dev/replay
// instead of the live backend. Same `{ connected }` contract.
export const useReplaySocket = ({ handleInitial, handleUpdate }: Props, { enabled }: Options) => {
	const sessionId = useReplayStore((s) => s.sessionId);
	const speed = useReplayStore((s) => s.speed);
	const epoch = useReplayStore((s) => s.epoch);
	const playing = useReplayStore((s) => s.playing);
	const connected = useReplayStore((s) => s.connected);

	// Always call the freshest handlers without making them effect deps.
	const handlersRef = useRef({ handleInitial, handleUpdate });
	useEffect(() => {
		handlersRef.current = { handleInitial, handleUpdate };
	});

	useEffect(() => {
		const store = useReplayStore.getState();

		if (!enabled || !sessionId || !playing) {
			store.setConnected(false);
			return;
		}

		const params = new URLSearchParams({
			session: sessionId,
			speed: String(speed),
			e: String(epoch),
		});
		// Only pass an explicit offset when resuming after a pause; otherwise let the
		// route pick its default start (skipMs).
		if (store.elapsedMs > 0) params.set("t", String(Math.floor(store.elapsedMs / 1000)));

		const sse = new EventSource(`/api/dev/replay?${params.toString()}`);

		sse.onopen = () => useReplayStore.getState().setConnected(true);
		sse.onerror = () => useReplayStore.getState().setConnected(false);

		sse.addEventListener("meta", (e) => {
			const { durationMs } = JSON.parse((e as MessageEvent).data);
			useReplayStore.getState().setDuration(durationMs ?? null);
		});

		sse.addEventListener("initial", (e) => {
			handlersRef.current.handleInitial(parseMessage((e as MessageEvent).data));
		});

		sse.addEventListener("update", (e) => {
			handlersRef.current.handleUpdate(parseMessage((e as MessageEvent).data));
		});

		sse.addEventListener("clock", (e) => {
			const { elapsedMs } = JSON.parse((e as MessageEvent).data);
			if (typeof elapsedMs === "number") useReplayStore.getState().setClock(elapsedMs);
		});

		sse.addEventListener("end", () => {
			useReplayStore.getState().setConnected(false);
			sse.close();
		});

		return () => {
			sse.close();
			useReplayStore.getState().setConnected(false);
		};
	}, [enabled, sessionId, speed, epoch, playing]);

	return { connected: enabled ? connected : false };
};
