#!/usr/bin/env python3
"""
NeuroScript — Local Development Server
Serves the handwriting recognition app on http://localhost:8001
"""

import http.server
import socketserver
import os
import sys
import webbrowser
import threading
import time

PORT = 8001
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# ANSI colors for pretty terminal output
CYAN   = "\033[96m"
GREEN  = "\033[92m"
YELLOW = "\033[93m"
BOLD   = "\033[1m"
RESET  = "\033[0m"


class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler with CORS headers for local development."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Cross-Origin-Opener-Policy",   "same-origin")
        self.send_header("Cache-Control",                "no-cache")
        super().end_headers()

    def log_message(self, format, *args):
        try:
            request = str(args[0]) if args else "-"
            parts   = request.split()
            method  = parts[0] if len(parts) > 0 else "-"
            path    = parts[1] if len(parts) > 1 else "-"
            code    = str(args[1]) if len(args) > 1 else "-"
            color   = GREEN if code.startswith("2") else YELLOW
            print(f"  {color}[{code}]{RESET} {method:6s} {path}")
        except Exception:
            pass  # Suppress noisy log errors

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()


def open_browser():
    """Open browser after a short delay."""
    time.sleep(1.2)
    url = f"http://localhost:{PORT}"
    print(f"\n  {CYAN}Opening browser at {BOLD}{url}{RESET}")
    webbrowser.open(url)


def main():
    os.chdir(DIRECTORY)

    print(f"""
  {CYAN}{BOLD}╔══════════════════════════════════════════╗
  ║    NeuroScript — AI HWDR Server          ║
  ╚══════════════════════════════════════════╝{RESET}

  {GREEN}●{RESET} Server running at:  {BOLD}http://localhost:{PORT}{RESET}
  {GREEN}●{RESET} Serving directory:  {DIRECTORY}
  {YELLOW}●{RESET} Press Ctrl+C to stop
""")

    # Auto-open browser
    threading.Thread(target=open_browser, daemon=True).start()

    with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
        httpd.allow_reuse_address = True
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n  {YELLOW}Server stopped.{RESET}\n")
            sys.exit(0)


if __name__ == "__main__":
    main()
