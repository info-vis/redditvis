from flask import Blueprint
from src.api.helpers.body_data_transformer import BodyDataTransformer

bp = Blueprint("api", __name__)
BodyDataTransformer().transform()

from src.api import routes
