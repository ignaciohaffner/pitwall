#!/usr/bin/env python3
"""
Downloads an F1 session from the livetiming.formula1.com static API
and converts it to f1-dash simulator format.

Fetches both the keyframe (initial state) and the full .jsonStream
update files, then merges them in timestamp order — producing a
proper replay file equivalent to a live-recorded session.

Usage:
  python download_session.py <session_path> [output_file]
  python download_session.py --list

Examples:
  python download_session.py \\
    "2026/2026-05-24_Canadian_Grand_Prix/2026-05-23_Qualifying/" \\
    canada-2026-qualifying.jsonl

  python download_session.py --list
"""

import json
import sys
import re
import urllib.request
from datetime import datetime, timezone, timedelta

BASE_URL  = "https://livetiming.formula1.com/static/"
INDEX_URL = "https://livetiming.formula1.com/static/2026/Index.json"

# Topics to include — order matters for the keyframe only
TOPICS = [
    "Heartbeat",
    "ExtrapolatedClock",
    "TopThree",
    "TimingStats",
    "TimingAppData",
    "WeatherData",
    "TrackStatus",
    "DriverList",
    "RaceControlMessages",
    "SessionInfo",
    "SessionData",
    "SessionStatus",
    "TimingData",
    "TeamRadio",
]

# Relative offset pattern at start of each jsonStream line
TS_RE = re.compile(r'^(\d+):(\d+):(\d+\.\d+)(.*)', re.DOTALL)


def fetch(url, binary=False):
    try:
        with urllib.request.urlopen(url, timeout=20) as resp:
            raw = resp.read()
            if binary:
                return raw
            return json.loads(raw.decode("utf-8-sig"))
    except Exception:
        return None


def parse_stream_line(line: str):
    """Parse 'HH:MM:SS.mmm{json}' → (timedelta, dict) or None."""
    m = TS_RE.match(line)
    if not m:
        return None
    h, mi, s_str, rest = m.groups()
    seconds = float(s_str)
    td = timedelta(hours=int(h), minutes=int(mi), seconds=seconds)
    rest = rest.strip()
    if not rest:
        return None
    try:
        return td, json.loads(rest)
    except Exception:
        return None


def session_start_utc(session_info: dict) -> datetime | None:
    """Extract session start as UTC datetime."""
    start_str = session_info.get("StartDate")
    gmt_offset = session_info.get("GmtOffset", "00:00:00")
    if not start_str:
        return None
    try:
        dt_local = datetime.fromisoformat(start_str)
        h, m, s = gmt_offset.split(":")
        offset = timedelta(hours=int(h), minutes=int(m), seconds=int(s))
        return dt_local.replace(tzinfo=timezone.utc) - offset
    except Exception:
        return None


def fmt_utc(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def list_sessions():
    data = fetch(INDEX_URL)
    if not data:
        print("Failed to fetch 2026 index", file=sys.stderr)
        return
    for meeting in data.get("Meetings", []):
        print(f"\n=== {meeting['Name']} ({meeting['Country']['Name']}) ===")
        for s in meeting.get("Sessions", []):
            print(f"  [{s['Key']:5}] {s['Name']:<25} {s['Path']}")


def download_session(session_path: str, output_file: str):
    if not session_path.endswith("/"):
        session_path += "/"

    print(f"Downloading: {session_path}", file=sys.stderr)

    # ── 1. Keyframes (initial state) ────────────────────────────────────
    print("\n[1/3] Fetching keyframes...", file=sys.stderr)
    keyframes = {}
    for topic in TOPICS:
        url = BASE_URL + session_path + topic + ".json"
        data = fetch(url)
        if data is not None:
            keyframes[topic] = data
            print(f"  {topic} ✓", file=sys.stderr)
        else:
            print(f"  {topic} –", file=sys.stderr)

    session_info = keyframes.get("SessionInfo", {})
    t0 = session_start_utc(session_info)
    session_type = session_info.get("Type", "Race")
    print(f"\n  Session start UTC: {t0}", file=sys.stderr)

    # Minimal keyframe: only what's needed to identify the session.
    # All timing data will be built up from the stream (Q1 → Q2 → Q3),
    # so we intentionally drop the Q3-final-state topics from the keyframe
    # to avoid the "backwards replay" problem.
    KEYFRAME_ONLY = {"SessionInfo", "DriverList", "WeatherData", "TrackStatus"}
    keyframes = {k: v for k, v in keyframes.items() if k in KEYFRAME_ONLY}

    # Inject a running clock — Extrapolating: true makes the timer count down live
    remaining = "01:00:00" if "Qualifying" in session_type else "02:00:00"
    keyframes["SessionStatus"]    = {"Status": "Started"}
    keyframes["ExtrapolatedClock"] = {
        "Utc":           fmt_utc(datetime.now(timezone.utc)),
        "Remaining":     remaining,
        "Extrapolating": True,
    }

    # ── 2. Streams ───────────────────────────────────────────────────────
    print("\n[2/3] Fetching streams...", file=sys.stderr)

    # All events: list of (absolute_utc_datetime, topic, data_dict)
    events: list[tuple[datetime, str, dict]] = []

    # Find which streams exist from the session index
    index = fetch(BASE_URL + session_path + "Index.json") or {}
    stream_topics = {
        name: info["StreamPath"]
        for name, info in index.get("Feeds", {}).items()
        if "StreamPath" in info
    }

    for topic, stream_path in stream_topics.items():
        url = BASE_URL + session_path + stream_path
        raw = fetch(url, binary=True)
        if raw is None:
            print(f"  {topic} stream –", file=sys.stderr)
            continue

        lines = raw.decode("utf-8-sig", errors="replace").splitlines()
        count = 0
        for line in lines:
            parsed = parse_stream_line(line)
            if parsed is None:
                continue
            td, data = parsed
            if t0:
                abs_utc = t0 + td
            else:
                abs_utc = datetime.now(timezone.utc)
            events.append((abs_utc, topic, data))
            count += 1
        print(f"  {topic}: {count} updates ✓", file=sys.stderr)

    # ── 3. Write output ──────────────────────────────────────────────────
    print(f"\n[3/3] Writing {len(events)} events → {output_file}", file=sys.stderr)

    events.sort(key=lambda e: e[0])

    out = open(output_file, "w") if output_file != "-" else sys.stdout

    # Line 1: initial state keyframe
    out.write(json.dumps({"I": "1", "R": keyframes}) + "\n")

    # Statuses that hide dashboard content — replace with "Started" in the stream
    HIDE_STATUSES = {"Ends", "Finalised", "Finished", "Inactive"}

    # Topics that must never appear in the stream — they cause the realtime
    # service to restart (SessionInfo) or break the replay experience.
    STREAM_BLACKLIST = {"SessionInfo", "ArchiveStatus", "ContentStreams", "AudioStreams"}

    # Rest: sorted update stream
    for abs_utc, topic, data in events:
        if topic in STREAM_BLACKLIST:
            continue
        # Keep SessionStatus alive
        if topic == "SessionStatus" and data.get("Status") in HIDE_STATUSES:
            data = {**data, "Status": "Started"}
        # Drop ExtrapolatedClock events that zero-out the timer (inter-session breaks)
        if topic == "ExtrapolatedClock" and data.get("Remaining") == "00:00:00":
            continue
        msg = {
            "M": [{
                "H": "Streaming",
                "M": "feed",
                "A": [topic, data, fmt_utc(abs_utc)],
            }]
        }
        out.write(json.dumps(msg) + "\n")

    if output_file != "-":
        out.close()
        print(f"\n✓ Written {1 + len(events)} lines to {output_file}", file=sys.stderr)


if __name__ == "__main__":
    args = sys.argv[1:]

    if not args or args[0] == "--list":
        list_sessions()
        sys.exit(0)

    session_path = args[0]
    output_file  = args[1] if len(args) > 1 else "-"
    download_session(session_path, output_file)
