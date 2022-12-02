from route.tool.func import *

def custom_run(conn, app):
    @app.route('/ping')
    def ping():
        return flask.jsonify({'status': 'pong'})