from flask import Blueprint

bp = Blueprint(
    "client", 
    __name__, 
    template_folder="templates",
    static_folder="static",
    static_url_path="/client/static"
)

from src.client import routes
