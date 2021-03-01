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

@bp.route('/sentimentBox')
def sentimentBox():
	target = request.args.get('target', default = 'None')
	sents = list(BodyModel.getInstance().get_sentiments)

	p = figure(plot_width=500, plot_height=50, tools ='') # The width and height may have to change
	p.axis.visible = False

	for i in range(len(sents)): # Dont know how efficient this will work
		if sents[i] == 1:
				p.quad(top=[2], bottom=[1], left=[i-1], right=[i], color='green')
		else:  
				p.quad(top=[2], bottom=[1], left=[i-1], right=[i], color='red')  
	return json.dumps(bokeh.embed.json_item(p, "sentimentBox"))


	
