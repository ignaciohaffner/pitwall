#!/usr/bin/env node
// Record a live F1 session straight from the realtime backend's SSE stream.
// The output is a replay-ready file (format: "sse") — one {event,data,t} per line —
// that you can drop into dev-sessions/manifest.json. This sidesteps the broken Rust
// `simulator` entirely.
//
// Usage:
//   node scripts/record-live.mjs <realtime-url> <out.jsonl>
//   node scripts/record-live.mjs https://f1-dev-live.home.ignaciohaffner.com ../australia-2026-practice.jsonl
//
// Run it while a session (practice / sprint / qualifying / race) is actually live.
// Ctrl-C to stop.

import { createWriteStream } from "node:fs";

const [, , baseUrl, outPath] = process.argv;

if (!baseUrl || !outPath) {
	console.error("usage: node scripts/record-live.mjs <realtime-url> <out.jsonl>");
	process.exit(1);
}

const url = `${baseUrl.replace(/\/$/, "")}/api/realtime`;
const out = createWriteStream(outPath, { flags: "w" });
const start = Date.now();
let count = 0;

console.log(`recording ${url} -> ${outPath}`);
console.log("Ctrl-C to stop\n");

const res = await fetch(url, { headers: { accept: "text/event-stream" } });
if (!res.ok || !res.body) {
	console.error(`failed to connect: HTTP ${res.status}`);
	process.exit(1);
}

const decoder = new TextDecoder();
let buffer = "";

const flushEvent = (raw) => {
	let event = "message";
	const dataLines = [];
	for (const line of raw.split("\n")) {
		if (line.startsWith("event:")) event = line.slice(6).trim();
		else if (line.startsWith("data:")) dataLines.push(line.slice(5).replace(/^ /, ""));
	}
	if (dataLines.length === 0) return;
	const dataStr = dataLines.join("\n");
	if (event !== "initial" && event !== "update") return; // skip keep-alives

	let data;
	try {
		data = JSON.parse(dataStr);
	} catch {
		return;
	}
	out.write(JSON.stringify({ event, data, t: Date.now() - start }) + "\n");
	count++;
	if (count % 50 === 0) process.stdout.write(`\r${count} events`);
};

process.on("SIGINT", () => {
	out.end();
	console.log(`\nsaved ${count} events to ${outPath}`);
	process.exit(0);
});

for await (const chunk of res.body) {
	buffer += decoder.decode(chunk, { stream: true });
	let idx;
	while ((idx = buffer.indexOf("\n\n")) !== -1) {
		flushEvent(buffer.slice(0, idx));
		buffer = buffer.slice(idx + 2);
	}
}

out.end();
console.log(`\nstream ended — saved ${count} events to ${outPath}`);
