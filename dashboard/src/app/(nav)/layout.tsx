import { type ReactNode } from "react";
import Link from "next/link";

import Footer from "@/components/Footer";

type Props = {
	children: ReactNode;
};

export default function Layout({ children }: Props) {
	return (
		<>
			<nav className="sticky top-0 left-0 z-10 flex h-10 w-full items-center justify-between border-b border-zinc-800 bg-black/80 px-4 font-mono backdrop-blur-lg">
				<div className="flex items-center gap-[2ch]">
					<Link className="text-zinc-300 transition-colors hover:text-white" href="/">
						<span className="text-zinc-600">{">"}</span> pitwall
					</Link>
					<span className="text-zinc-800">│</span>
					<Link
						className="text-[11px] tracking-widest text-zinc-500 uppercase transition-colors hover:text-zinc-300"
						href="/dashboard"
					>
						dashboard
					</Link>
					<Link
						className="text-[11px] tracking-widest text-zinc-500 uppercase transition-colors hover:text-zinc-300"
						href="/schedule"
					>
						schedule
					</Link>
					<Link
						className="text-[11px] tracking-widest text-zinc-500 uppercase transition-colors hover:text-zinc-300"
						href="/help"
					>
						help
					</Link>
				</div>

				<div className="hidden items-center gap-[2ch] sm:flex">
					<span className="text-zinc-800">│</span>
					<Link
						className="text-[11px] tracking-widest text-zinc-600 uppercase transition-colors hover:text-zinc-400"
						href="https://github.com/ignaciohaffner/pitwall"
						target="_blank"
					>
						[github]
					</Link>
					<Link
						className="text-[11px] tracking-widest text-zinc-600 uppercase transition-colors hover:text-zinc-400"
						href="https://github.com/slowlydev/f1-dash"
						target="_blank"
					>
						[fork of f1-dash]
					</Link>
				</div>
			</nav>

			<main className="container mx-auto max-w-(--breakpoint-lg) px-4">
				{children}

				<Footer />
			</main>
		</>
	);
}
