import Link from "next/link";

export default function Home() {
	return (
		<div>
			<section className="flex h-screen w-full flex-col justify-center gap-8 font-mono">
				<div className="flex flex-col gap-2">
					<span className="text-[11px] uppercase tracking-widest text-zinc-600">{">"} pitwall</span>
					<h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
						real-time formula 1<br />
						telemetry and timing
					</h1>
				</div>

				<div className="flex flex-wrap gap-[2ch]">
					<Link
						href="/dashboard"
						className="border border-zinc-600 px-4 py-2 text-[11px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-400 hover:text-white"
					>
						[ launch dashboard ]
					</Link>
					<Link
						href="/schedule"
						className="border border-zinc-800 px-4 py-2 text-[11px] uppercase tracking-widest text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300"
					>
						[ view schedule ]
					</Link>
				</div>
			</section>

			<section className="pb-20 font-mono">
				<p className="mb-2 border-b border-zinc-800 pb-1 text-[11px] uppercase tracking-widest text-zinc-500">
					about
				</p>

				<p className="text-sm text-zinc-400">
					pitwall is a real-time telemetry and timing dashboard for formula 1. live lap times, sector times,
					gaps between drivers, tire choices, and much more.
				</p>
			</section>
		</div>
	);
}
