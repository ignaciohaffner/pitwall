import Link from "next/link";

export default function Footer() {
	return (
		<footer className="my-8 font-mono">
			<div className="mb-2 flex flex-wrap items-center gap-[1.5ch] text-[11px] text-zinc-600">
				<span>pitwall</span>
				<span className="text-zinc-800">│</span>
				<TextLink website="https://github.com/ignaciohaffner/pitwall">github</TextLink>
				<span className="text-zinc-800">│</span>
				<TextLink website="https://github.com/slowlydev/f1-dash">fork of f1-dash</TextLink>
				<span className="text-zinc-800">│</span>
				<Link className="text-zinc-600 transition-colors hover:text-zinc-400" href="/help">
					help
				</Link>
				<span className="text-zinc-800">│</span>
				<span>v{process.env.version}</span>
			</div>

			<p className="text-[10px] leading-relaxed text-zinc-700">
				unofficial project, not associated with formula one companies. f1, formula one, formula 1, fia formula one world
				championship, grand prix and related marks are trademarks of formula one licensing b.v.
			</p>
		</footer>
	);
}

type TextLinkProps = {
	website: string;
	children: string;
};

const TextLink = ({ website, children }: TextLinkProps) => {
	return (
		<a className="text-zinc-600 transition-colors hover:text-zinc-400" target="_blank" href={website}>
			{children}
		</a>
	);
};
