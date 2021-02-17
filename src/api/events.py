from src.api.model.body_model import BodyModel
from .. import socketio


@socketio.on('connect')
def test_connect():
    print("Connection succesful")


@socketio.on('ready_for_data')
def handle_ready_for_data():
    print("Sending data to client.")
    payload = BodyModel.getInstance().get_random_20().to_json(orient="split")
    socketio.emit("data_sent", payload)
