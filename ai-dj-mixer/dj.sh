#!/bin/bash
# Quick AI DJ trigger
# Usage: ./dj.sh [type]
# Types: next_song, station_id, time_check, weather, news, auto

cd "$(dirname "$0")"
source venv/bin/activate

TYPE=${1:-auto}
python llm_dj.py --type "$TYPE"
