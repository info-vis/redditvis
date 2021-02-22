from flask import render_template
from src.client import bp


@bp.route('/', methods=['GET'])
def index():
	return render_template("index.html")
