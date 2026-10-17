# Vista previa local con las mismas rutas que producción (GitHub Pages):
#   /checkout            ->  checkout.html
#   /catalogo            ->  301 a /catalogo/  ->  catalogo/index.html
#   /catalogo/navidad/x  ->  catalogo/navidad/x.html
#   python previsualizar.py        ->  http://127.0.0.1:8931/
import http.server, os, sys

class Rutas(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        ruta, _, resto = self.path.partition('?')
        ruta = ruta.split('#')[0]
        archivo = self.translate_path(ruta)
        if os.path.isdir(archivo):
            # una carpeta con index.html se sirve con barra final (como GitHub Pages)
            if os.path.exists(os.path.join(archivo, 'index.html')):
                if not ruta.endswith('/'):
                    self.send_response(301)
                    self.send_header('Location', ruta + '/' + ('?' + resto if resto else ''))
                    self.send_header('Content-Length', '0')
                    self.end_headers()
                    return None
        elif not os.path.exists(archivo) and os.path.exists(archivo + '.html'):
            self.path = ruta + '.html' + ('?' + resto if resto else '')
        elif not os.path.exists(archivo):
            self.path = '/404.html'
        return super().send_head()

    def log_message(self, *a):
        pass

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8931
    print('Giandeco en http://127.0.0.1:%d/' % puerto)
    http.server.ThreadingHTTPServer(('127.0.0.1', puerto), Rutas).serve_forever()
