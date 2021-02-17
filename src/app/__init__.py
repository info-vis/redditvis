from flask import Blueprint

bp = Blueprint("application", __name__, template_folder="templates")

from src.app import routes
