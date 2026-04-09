import http.server
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

handler = http.server.SimpleHTTPRequestHandler
handler.extensions_map.update({
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.md': 'text/plain',
})

server = http.server.HTTPServer(('', 8780), handler)
print(f"Serving DEADZONE on http://localhost:8780")
server.serve_forever()
