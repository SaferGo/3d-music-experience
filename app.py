from red_light_green_light import app
from livereload import Server

if __name__ == '__main__':
    server = Server(app.wsgi_app)
    server.serve(port=5000, host='localhost')
