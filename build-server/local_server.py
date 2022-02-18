import http.server, socketserver
import logging
from os import curdir, sep, path

"""Extremely simple HTTP server to run local and test the site."""

HOST = 'localhost'
PORT = 8080

INDEX_URL = 'index.html'
ERROR_URL = '404.html'          # Must live in root folder

DEBUG_LEVEL = logging.INFO      # Either INFO or DEBUG
# DEBUG_LEVEL = logging.DEBUG   #

# Improvements from: https://gist.github.com/mdonkers/63e115cc0c79b4f6b8b3a6b797e485c7

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        if code == 404:
            logging.debug('404 error code detected')
            self.error_message_format = ''
            with open(curdir + sep + ERROR_URL, 
                      mode='r', encoding='utf-8') as f:
                self.error_message_format = f.read()
                logging.debug('File %s read successfully.' % ERROR_URL)

        http.server.SimpleHTTPRequestHandler.send_error(self, code, message)

    def do_GET(self):
        if logging.DEBUG <= logging.root.level:
            logging.debug("GET request\nPath: %s\nHeaders:\n%s\n", 
                      str(self.path), str(self.headers))

        if self.path == '/':
            self.path = INDEX_URL
        return http.server.SimpleHTTPRequestHandler.do_GET(self)


def run():
    with socketserver.TCPServer((HOST, PORT), MyHttpRequestHandler) as server:
        logging.info('Serving on %(host)s, port %(port)d' % {
            'host': HOST,
            'port': PORT
        })
        server.serve_forever()


if __name__ == "__main__":
    logging.basicConfig(level=DEBUG_LEVEL)

    try:
        run()
    except KeyboardInterrupt:
        logging.info('Aborted by user.')
    
    logging.info('Stopped httpd.')
