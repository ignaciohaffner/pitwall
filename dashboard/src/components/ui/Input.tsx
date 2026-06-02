"use client";

type Props = {
	value: string;
	setValue: (value: string) => void;
};

export default function Input({ value, setValue }: Props) {
	return (
		<input
			className="w-12 border border-zinc-700 bg-black px-1 py-0.5 text-center font-mono text-sm text-zinc-300 [appearance:textfield] focus:border-zinc-500 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
			type="text"
			value={value}
			onChange={(e) => setValue(e.target.value)}
		/>
	);
}
