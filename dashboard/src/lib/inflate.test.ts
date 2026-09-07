import { describe, it, expect } from "vitest";
import { deflateRaw } from "pako";

import { inflate, inflateSafe } from "./inflate";

// mirror of how the F1 feed encodes .z topics: raw-deflate the JSON, then base64
const encode = (obj: unknown): string => {
	const raw = deflateRaw(JSON.stringify(obj));
	let bin = "";
	for (let i = 0; i < raw.length; i++) bin += String.fromCharCode(raw[i]);
	return btoa(bin);
};

describe("inflate", () => {
	it("round-trips a deflated + base64'd payload", () => {
		const payload = { Entries: [{ Utc: "2026-01-01T00:00:00Z", Cars: { "1": { Channels: { "2": 320 } } } }] };
		expect(inflate(encode(payload))).toEqual(payload);
	});

	it("throws on garbage", () => {
		expect(() => inflate("not-base64-!!!")).toThrow();
	});
});

describe("inflateSafe", () => {
	it("returns the value on a good payload", () => {
		expect(inflateSafe(encode({ a: 1 }))).toEqual({ a: 1 });
	});

	it("returns null instead of throwing on a bad payload", () => {
		expect(inflateSafe("not-base64-!!!")).toBeNull();
		expect(inflateSafe(btoa("plain text, not deflate"))).toBeNull();
	});
});
