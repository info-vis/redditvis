from flask import Blueprint
from src.api.helpers.body_data_transformer import BodyDataTransformer
from src.api.helpers.node_attribute_transformer import NodeAttributeTransformer

bp = Blueprint("api", __name__)
BodyDataTransformer().transform()
NodeAttributeTransformer().transform()

from src.api import routes
