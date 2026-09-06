"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";

import { useSidebarStore } from "@/stores/useSidebarStore";

import ConnectionStatus from "@/components/ConnectionStatus";
import DelayInput from "@/components/DelayInput";
import SidenavButton from "@/components/SidenavButton";
import DelayTimer from "@/components/DelayTimer";


type Props = {
	connected: boolean;
};

export default function Sidebar({ connected }: Props) {
	// const favoriteDrivers = useSettingsStore((state) => state.favoriteDrivers);
	// const drivers = useDataStore((state) => state.driverList);

	// const driverItems = drivers
	// 	? favoriteDrivers.map((nr) => ({
	// 			href: `/dashboard/driver/${nr}`,
	// 			name: drivers[nr].fullName,
	// 		}))
	// 	: null;

	const { opened, pinned } = useSidebarStore();
	const close = useSidebarStore((state) => state.close);
	const open = useSidebarStore((state) => state.open);

	const pin = useSidebarStore((state) => state.pin);
	const unpin = useSidebarStore((state) => state.unpin);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				unpin();
			}
		};

		window.addEventListener("resize", handleResize);
		handleResize();

		return () => window.removeEventListener("resize", handleResize, false);
	}, [unpin]);

	return (
		<div>
			<motion.div className="hidden md:block" style={{ width: 216 }} animate={{ width: pinned ? 216 : 8 }} />

			<AnimatePresence>
				{opened && (
					<motion.div
						onTouchEnd={() => close()}
						className="fixed top-0 right-0 bottom-0 left-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					/>
				)}
			</AnimatePresence>

			<motion.div
				className="no-scrollbar fixed top-0 bottom-0 left-0 z-40 flex overflow-y-auto"
				//
				onHoverEnd={!pinned ? () => close() : undefined}
				onHoverStart={!pinned ? () => open() : undefined}
				//
				animate={{ left: pinned || opened ? 0 : -216 }}
				transition={{ type: "spring", bounce: 0.1 }}
			>
				<nav
					className={clsx("flex w-52 flex-col border-zinc-800 bg-black px-2 py-2", {
						"border": !pinned,
						"border-r": pinned,
					})}
				>
					<div className="flex items-center justify-between gap-[1ch]">
						<div className="flex items-center gap-[1.5ch]">
							<DelayInput saveDelay={500} />
							<DelayTimer />
							<ConnectionStatus connected={connected} />
						</div>

						<SidenavButton className="hidden md:flex" onClick={() => (pinned ? unpin() : pin())} />
						<SidenavButton className="md:hidden" onClick={() => close()} />
					</div>

					<Link href="/dashboard" className="mt-3 border border-zinc-700 px-3 py-1.5 text-center font-mono text-[11px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white">
						→ back to race
					</Link>

					<p className="mt-4 mb-1 px-2 text-[11px] uppercase tracking-widest text-zinc-600">general</p>

					<div className="flex flex-col">
						<Item item={{ href: "/dashboard/settings", name: "settings" }} />
						<Item target="_blank" item={{ href: "/schedule", name: "schedule" }} />
						<Item target="_blank" item={{ href: "/help", name: "help" }} />
						<Item target="_blank" item={{ href: "/", name: "home" }} />
					</div>

					<p className="mt-4 mb-1 px-2 text-[11px] uppercase tracking-widest text-zinc-600">links</p>

					<div className="flex flex-col">
						<Item target="_blank" item={{ href: "https://github.com/slowlydev/f1-dash", name: "github" }} />
						<Item target="_blank" item={{ href: "https://discord.gg/unJwu66NuB", name: "discord" }} />
						<Item target="_blank" item={{ href: "https://buymeacoffee.com/slowlydev", name: "coffee" }} />
						<Item target="_blank" item={{ href: "https://github.com/sponsors/slowlydev", name: "sponsor" }} />
					</div>
				</nav>
			</motion.div>
		</div>
	);
}

type ItemProps = {
	target?: string;
	item: { href: string; name: string };
};

const Item = ({ target, item }: ItemProps) => {
	const active = usePathname() === item.href;

	return (
		<Link href={item.href} target={target}>
			<div
				className={clsx("px-2 py-1 font-mono text-sm transition-colors", {
					"text-white": active,
					"text-zinc-500 hover:text-zinc-300": !active,
				})}
			>
				{item.name}
			</div>
		</Link>
	);
};
