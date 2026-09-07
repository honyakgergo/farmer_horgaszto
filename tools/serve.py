"""Helyi előnézet: python tools/serve.py  ->  http://localhost:8000

Gyorsítótár nélkül szolgálja ki a fájlokat, hogy a CSS/JS módosítások
azonnal látszódjanak újratöltéskor.
"""

import http.server
import os
import socketserver
import webbrowser

PORT = 8000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"Farmer Horgásztó — {url}  (Ctrl+C a leállításhoz)")
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nLeállítva.")
