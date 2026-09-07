import Link from "next/link";

import Button from "@/components/ui/Button";

export default function NotFound() {
	return (
		<div className="container mx-auto max-w-(--breakpoint-lg) px-4">
			<section className="flex h-screen w-full flex-col items-center justify-center gap-6 font-mono">
				<p className="text-[11px] tracking-widest text-zinc-600 uppercase">404</p>
				<p className="text-4xl font-bold text-white">page not found</p>
				<Link href="/">
					<Button>go back home</Button>
				</Link>
			</section>
		</div>
	);
}
