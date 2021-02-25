import json
import math

import bokeh
import numpy as np
from bokeh.plotting import figure
from flask import request
from src.api import bp
from src.api.model.body_model import BodyModel


# Currently unused
@bp.route('/body', methods=['GET'])
def index():
	data = BodyModel.getInstance().get_random_20()
	return data.to_json(orient="split")

@bp.route("/greeting")
def greeting():
	return {'greeting': 'Hello from Flask!'}

@bp.route("/demo-data")
def mypage():
	num = int(request.args.get('num', default="20"))
	data = BodyModel.getInstance().get_top_target_subreddits(num)
	return data.to_json(orient="split")

@bp.route('/plot1')
def plot1():
	num = int(request.args.get('num', default="20"))
	data = BodyModel.getInstance().get_top_target_subreddits(num)

	p = figure(x_range=data["TARGET_SUBREDDIT"], plot_height=300, title="Top 20 targeted subreddits",
           toolbar_location=None, tools="")

	p.vbar(x=list(data["TARGET_SUBREDDIT"]), top=list(data["counts"]), width=0.9)
	p.xaxis.major_label_orientation = math.pi/2

	return json.dumps(bokeh.embed.json_item(p, "myplot"))

@bp.route('/top-properties')
def topproperties():
	subreddit = request.args.get('subreddit', default="ps4")
	data = BodyModel.getInstance().get_top_properties_of_source_subreddit(subreddit)

	p=figure(x_range=list(data['index']), plot_height=300, title="Top properties of subreddit",
           toolbar_location=None, tools="")
	
	p.vbar(x=list(data['index']), top=list(data[subreddit]), width=0.9)
	p.xaxis.major_label_orientation = math.pi/2

	return json.dumps(bokeh.embed.json_item(p, "topproperties"))