import type { Metadata } from "next";

const title = "pitwall | Formula 1 live timing";
const description =
	"Real-time Formula 1 timing and telemetry — leaderboard, tyres, gaps, lap times, mini sectors, team radios and more, in a terminal-style dashboard.";

const url = "https://f1.ignaciohaffner.com";

export const metadata: Metadata = {
	generator: "Next.js",

	applicationName: title,

	title,
	description,

	icons: "/favicon.png",

	openGraph: {
		title,
		description,
		url,
		type: "website",
		siteName: "pitwall",
		// og image comes from src/app/opengraph-image.png (Next file convention)
	},

	twitter: {
		title,
		description,
		card: "summary_large_image",
		// twitter image comes from src/app/twitter-image.png
	},

	category: "Sports & Recreation",

	referrer: "strict-origin-when-cross-origin",

	keywords: ["pitwall", "Formula 1", "f1 dashboard", "realtime telemetry", "f1 timing", "live timing"],

	authors: [{ name: "Ignacio Haffner", url }],

	appleWebApp: {
		capable: true,
		title: "pitwall",
		statusBarStyle: "black-translucent",
	},

	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},

	metadataBase: new URL(url),

	alternates: {
		canonical: url,
	},

	manifest: "/manifest.json",
};
