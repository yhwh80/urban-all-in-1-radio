#!/usr/bin/env liquidsoap

# =============================================================================
# AI DJ MIXER - Production Liquidsoap Script (2.3.x)
# Urban All-in-1 Radio (Docker/VPS version)
# =============================================================================

# MUST be first - allow running as root in Docker
settings.init.allow_root := true

settings.log.level := 3

# --- Telnet server for receiving voice commands ---
settings.server.telnet := true
settings.server.telnet.port := 1234
settings.server.telnet.bind_addr := "127.0.0.1"

# --- Configuration ---
azuracast_stream = "http://72.62.210.209/listen/urban_all_in_1_radio/radio.mp3"
icecast_host = "127.0.0.1"
icecast_port = 8001
icecast_mount = "/radio.mp3"
icecast_password = "UrbanDJ2025!"

# --- Input: Pull AzuraCast stream ---
music = input.http(azuracast_stream)
music = buffer(fallible=true, music)
music = fallback(track_sensitive=false, [music, blank()])

# --- Voice Queue: accepts files via telnet ---
voice_queue = request.queue(id="voice_queue")

# Boost voice volume (1.5x louder)
voice_loud = amplify(1.5, voice_queue)

# --- Ducking: Mix voice over music (duck music to 15% when voice plays) ---
output_source = smooth_add(
  normal=music,
  special=voice_loud,
  p=fun() -> 0.15
)

# --- Output: Stream to local Icecast2 on port 8001 ---
output.icecast(
  %mp3(bitrate=192),
  host=icecast_host,
  port=icecast_port,
  mount=icecast_mount,
  password=icecast_password,
  fallible=true,
  output_source
)

print("AI DJ Mixer Started - Listening on telnet:1234")
