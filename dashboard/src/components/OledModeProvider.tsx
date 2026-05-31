"use client";

import { useEffect, type ReactNode } from "react";

import { useSettingsStore } from "@/stores/useSettingsStore";

type Props = {
	children: ReactNode;
};

export default function OledModeProvider({ children }: Props) {
	const oledMode = useSettingsStore((state) => state.oledMode);

	useEffect(() => {
		document.documentElement.classList.remove("bg-zinc-950", "bg-black");
		document.documentElement.classList.add("bg-black");
	}, [oledMode]);

	return children;
}
