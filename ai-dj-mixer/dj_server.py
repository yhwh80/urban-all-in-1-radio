#!/usr/bin/env python3
"""
Simple HTTP server to trigger AI DJ announcements.
Used by n8n to schedule DJ breaks.
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
from llm_dj_convex import run_ai_dj

PORT = 3001

class DJHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests."""
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok'}).encode())

        elif parsed.path == '/trigger':
            # Get announcement type and intro flag from query params
            params = urllib.parse.parse_qs(parsed.query)
            ann_type = params.get('type', ['auto'])[0]
            # Parse intro flag (can be 'true', 'false', 'True', 'False', '1', '0')
            intro_str = params.get('intro', ['false'])[0].lower()
            has_intro = intro_str in ('true', '1', 'yes')

            try:
                print(f"🎙️ n8n trigger: type={ann_type}, intro={has_intro}")
                result = run_ai_dj(ann_type, talk_over_intro=has_intro)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())

        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

    def do_POST(self):
        """Handle POST requests."""
        if self.path == '/trigger':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode() if content_length else '{}'

            try:
                data = json.loads(body) if body else {}
                ann_type = data.get('type', 'auto')

                result = run_ai_dj(ann_type)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        print(f"[DJ Server] {args[0]}")


if __name__ == '__main__':
    print(f"🎙️  AI DJ Server starting on port {PORT}...")
    print(f"   Trigger: http://localhost:{PORT}/trigger")
    print(f"   Health:  http://localhost:{PORT}/health")
    print()

    server = HTTPServer(('0.0.0.0', PORT), DJHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 DJ Server stopped")
