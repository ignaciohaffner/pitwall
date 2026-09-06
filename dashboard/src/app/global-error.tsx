"use client";

import Button from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<div className="flex h-dvh w-full flex-col items-center justify-center gap-4 font-mono">
			<p className="text-[11px] tracking-widest text-red-600 uppercase">error</p>
			<p className="text-sm text-zinc-400">{error.message}</p>
			<Button onClick={() => reset()}>try again</Button>
		</div>
	);
}
