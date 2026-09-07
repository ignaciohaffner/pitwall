type Props = {
	on: boolean;
	possible: boolean;
	inPit: boolean;
	pitOut: boolean;
};

export default function DriverDRS({ on, possible, inPit, pitOut }: Props) {
	if (inPit || pitOut) {
		return <span className="block font-bold text-cyan-400">PIT</span>;
	}
	if (on) {
		return <span className="block font-bold text-emerald-400">DRS</span>;
	}
	if (possible) {
		return <span className="block text-zinc-500">OVT</span>;
	}
	return <span className="block text-zinc-800">---</span>;
}
