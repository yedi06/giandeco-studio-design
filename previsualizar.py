# Vista previa local con las mismas rutas que producción (sin .html).
#   python previsualizar.py        ->  http://127.0.0.1:8931/
import http.server, os, sys

class Rutas(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        ruta = self.path.split('?')[0].split('#')[0]
        archivo = self.translate_path(ruta)
        # /checkout  ->  checkout.html
        if not os.path.exists(archivo) and os.path.exists(archivo + '.html'):
            self.path = ruta + '.html' + self.path[len(ruta):]
        elif not os.path.exists(archivo):
            self.path = '/404.html'
        return super().send_head()

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8931
    print('Giandeco en http://127.0.0.1:%d/' % puerto)
    http.server.ThreadingHTTPServer(('127.0.0.1', puerto), Rutas).serve_forever()
