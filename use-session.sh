#!/bin/bash
# Switch the simulator to a different session file and restart it.
#
# Usage: ./use-session.sh <session.jsonl>
#
# Available sessions:
#   canada-2026-qualifying.jsonl    Canadian GP 2026 Qualifying (Q3 final)
#   canada-2026-race.jsonl          Canadian GP 2026 Race (final)
#   australia-2026-qualifying.jsonl Australian GP 2026 Qualifying (Q3 final)
#   mock-session.jsonl              Monaco 2024 Race (generated mock)
#   silverstone-2024-race.jsonl     Silverstone 2024 Race (real data)
#
# Download more sessions:
#   python3 download_session.py --list
#   python3 download_session.py "<path>" <output.jsonl>

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <session.jsonl>"
  echo ""
  echo "Available sessions:"
  ls -1 *.jsonl 2>/dev/null | sed 's/^/  /'
  exit 1
fi

SESSION="$1"

if [ ! -f "$SESSION" ]; then
  echo "Error: $SESSION not found"
  exit 1
fi

echo "→ Switching to: $SESSION"
cp "$SESSION" mock-session.jsonl

echo "→ Restarting simulator..."
docker compose restart simulator

echo "✓ Done. The simulator is now replaying: $SESSION"
