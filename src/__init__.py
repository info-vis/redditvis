from flask import Flask
from flask_socketio import SocketIO

socketio = SocketIO()


def register_blueprints(flask_app):
    from src.client import bp as client_bp
    from src.api import bp as api_bp
    flask_app.register_blueprint(client_bp)
    flask_app.register_blueprint(api_bp, url_prefix="/api")


def create_app():
    flask_app = Flask(__name__)
    register_blueprints(flask_app)
    socketio.init_app(flask_app)
    return flask_app


def run_app():
    app = create_app()
    socketio.run(app, debug=True, host="0.0.0.0")