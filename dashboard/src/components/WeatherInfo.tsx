import { useDataStore } from "@/stores/useDataStore";
import { getWindDirection } from "@/lib/getWindDirection";

export default function WeatherInfo() {
	const weather = useDataStore((state) => state.state?.WeatherData);

	if (!weather) {
		return (
			<span className="font-mono text-sm text-zinc-700">
				TRC --- AIR --- HUM --- --- ---
			</span>
		);
	}

	const trc = Math.round(parseFloat(weather.TrackTemp));
	const air = Math.round(parseFloat(weather.AirTemp));
	const hum = Math.round(parseFloat(weather.Humidity));
	const speed = parseFloat(weather.WindSpeed).toFixed(1);
	const dir = getWindDirection(parseInt(weather.WindDirection));
	const rain = weather.Rainfall === "1";

	return (
		<span className="flex items-center gap-[2ch] font-mono text-sm">
			<span>
				<span className="text-zinc-600">TRC</span>{" "}
				<span className="tabular-nums text-amber-300">{trc}°</span>
			</span>
			<span>
				<span className="text-zinc-600">AIR</span>{" "}
				<span className="tabular-nums text-sky-300">{air}°</span>
			</span>
			<span>
				<span className="text-zinc-600">HUM</span>{" "}
				<span className="tabular-nums text-zinc-300">{hum}%</span>
			</span>
			<span>
				<span className="text-zinc-600">{dir}</span>{" "}
				<span className="tabular-nums text-zinc-300">{speed}m/s</span>
			</span>
			{rain ? (
				<span className="font-bold text-blue-400">RAIN</span>
			) : (
				<span className="text-zinc-600">DRY</span>
			)}
		</span>
	);
}
