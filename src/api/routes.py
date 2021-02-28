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
def top_properties():
	source_subreddit = request.args.get('source-subreddit')
	target_subreddit = request.args.get('target-subreddit')

	if source_subreddit and target_subreddit: 
		data = BodyModel.getInstance().get_top_properties(source_subreddit, target_subreddit)

		def make_plot(data):
			p=figure(x_range=list(data.index), plot_height=300, title=f"Top properties of the subreddit - {source_subreddit} with target subreddit - {target_subreddit}",
					toolbar_location=None, tools="")

			p.vbar(x=list(data.index), top=list(data.values), width=0.9)
			p.xaxis.major_label_orientation = math.pi/2
			return p
    
		p=make_plot(data)

		return json.dumps(bokeh.embed.json_item(p, "top_properties"))
	elif source_subreddit:
		data = BodyModel.getInstance().get_top_properties(source_subreddit)

		p=figure(x_range=list(data.index), plot_height=300, title=f"Top properties of source subreddit - {source_subreddit}",
           toolbar_location=None, tools="")
		p.vbar(x=list(data.index), top=list(data.values), width=0.9)
		p.xaxis.major_label_orientation = math.pi/2

		return json.dumps(bokeh.embed.json_item(p, "top_properties"))
	elif target_subreddit:
		data = BodyModel.getInstance().get_top_properties(target_subreddit)

		p=figure(x_range=list(data.index), plot_height=300, title=f"Top properties of target subreddit - {target_subreddit}",
           toolbar_location=None, tools="")
		p.vbar(x=list(data.index), top=list(data.values), width=0.9)
		p.xaxis.major_label_orientation = math.pi/2

		return json.dumps(bokeh.embed.json_item(p, "top_properties"))
	else: 
		data = BodyModel.getInstance().get_top_properties()

		p=figure(x_range=list(data.index), plot_height=300, title="Top properties of all subreddits",
           toolbar_location=None, tools="")
		p.vbar(x=list(data.index), top=list(data.values), width=0.9)
		p.xaxis.major_label_orientation = math.pi/2

		return json.dumps(bokeh.embed.json_item(p, "top_properties"))
