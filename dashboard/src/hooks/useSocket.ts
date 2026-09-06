import { useEffect, useRef, useState } from "react";

import type { MessageInitial, MessageUpdate } from "@/types/message.type";

import { env } from "@/env";

type Props = {
	handleInitial: (data: MessageInitial) => void;
	handleUpdate: (data: MessageUpdate) => void;
};

type Options = {
	// when false the socket stays closed (used by the dev replay mode to avoid a
	// second connection fighting over the same handlers)
	enabled?: boolean;
};

export const useSocket = ({ handleInitial, handleUpdate }: Props, { enabled = true }: Options = {}) => {
	const [connected, setConnected] = useState<boolean>(false);

	const handlersRef = useRef({ handleInitial, handleUpdate });
	useEffect(() => {
		handlersRef.current = { handleInitial, handleUpdate };
	});

	useEffect(() => {
		if (!enabled) return;

		const sse = new EventSource(`${env.NEXT_PUBLIC_LIVE_URL}/api/realtime`);

		sse.onerror = () => setConnected(false);
		sse.onopen = () => setConnected(true);

		sse.addEventListener("initial", (message) => {
			handlersRef.current.handleInitial(JSON.parse(message.data));
		});

		sse.addEventListener("update", (message) => {
			handlersRef.current.handleUpdate(JSON.parse(message.data));
		});

		return () => sse.close();
	}, [enabled]);

	return { connected: enabled ? connected : false };
};
