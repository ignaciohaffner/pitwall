"use client";

import { Switch } from "@headlessui/react";

type Props = {
	enabled: boolean;
	setEnabled: (value: boolean) => void;
};

export default function Toggle({ enabled, setEnabled }: Props) {
	return (
		<Switch
			checked={enabled}
			onChange={setEnabled}
			className="cursor-pointer font-mono text-sm tabular-nums"
		>
			{enabled ? (
				<span className="text-zinc-300">[ ● ]</span>
			) : (
				<span className="text-zinc-600">[ ○ ]</span>
			)}
		</Switch>
	);
}
