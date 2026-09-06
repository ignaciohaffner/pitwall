export default function NoSession() {
	return (
		<div className="flex flex-col gap-1 px-2 py-6 font-mono text-sm text-zinc-600">
			<p className="text-zinc-500">no live session</p>
			<p className="text-[11px] text-zinc-700">
				the feed only carries data during a session — add <span className="text-zinc-500">?dev=1</span> to the URL for
				replay mode
			</p>
		</div>
	);
}
