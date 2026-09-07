"use client";

import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useState } from "react";
import clsx from "clsx";

type Option<T> = {
	value: T;
	label: string;
};

type Props<T> = {
	placeholder?: string;
	options: Option<T>[];
	selected: T[];
	setSelected: (value: T[]) => void;
};

export default function SelectMultiple<T>({ placeholder, options, selected, setSelected }: Props<T>) {
	const [query, setQuery] = useState("");

	const filteredOptions =
		query === "" ? options : options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));

	return (
		<Combobox value={selected} onChange={(value) => setSelected(value)} onClose={() => setQuery("")} multiple>
			<div className="relative">
				<ComboboxInput
					placeholder={placeholder}
					className={clsx(
						"w-full border border-zinc-700 bg-black py-1.5 pr-8 pl-3 font-mono text-sm text-zinc-300 placeholder:text-zinc-600",
						"focus:border-zinc-500 focus:outline-none",
					)}
					displayValue={(option: Option<T> | null) => option?.label ?? ""}
					onChange={(event) => setQuery(event.target.value)}
				/>
				<ComboboxButton className="absolute inset-y-0 right-0 px-2.5 font-mono text-xs text-zinc-600">▾</ComboboxButton>
			</div>

			<ComboboxOptions
				anchor="bottom"
				className={clsx(
					"z-50 mt-1 w-[var(--input-width)] border border-zinc-700 bg-black p-0 [--anchor-gap:var(--spacing-1)] empty:invisible",
					"transition duration-100 ease-in data-leave:data-closed:opacity-0",
				)}
			>
				{filteredOptions.slice(0, 5).map((option, idx) => (
					<ComboboxOption
						key={idx}
						value={option.value}
						className="cursor-pointer px-3 py-1.5 font-mono text-sm text-zinc-400 select-none data-focus:bg-zinc-900 data-focus:text-zinc-200"
					>
						{option.label}
					</ComboboxOption>
				))}
			</ComboboxOptions>
		</Combobox>
	);
}
