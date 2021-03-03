import json
import math

import bokeh
import numpy as np
from bokeh.plotting import figure
from flask import request
from src.api import bp
from src.api.helpers.network_graph_helper import NetworkGraphHelper
from src.api.model.body_model import BodyModel
from math import pi


# Currently unused
@bp.route('/body', methods=['GET'])
def index():
	data = BodyModel.getInstance().get_random_20()
	return data.to_json(orient="split")

@bp.route('/sentiment-box')
def sentiment_box():
	source_subreddit = request.args.get('source-subreddit')

	if source_subreddit is None:
		raise ValueError("Cannot load sentiments for the entire data set. A source-subreddit as a query parameter is mandatory.")
	
	sentiments = BodyModel.getInstance().get_sentiments(source_subreddit)

	p = figure(plot_width=350, plot_height=100, tools ='') # The width and height may have to change
	p.title.text = 'Sentiment per post for ' + source_subreddit 
	p.axis.visible = False
	p.toolbar.logo = None
	p.toolbar_location = None

	for i in range(len(sentiments)):
		if sentiments[i] == 1:
				p.quad(top=[2], bottom=[1], left=[i-1], right=[i], color='green')
		else:  
				p.quad(top=[2], bottom=[1], left=[i-1], right=[i], color='red')  
	return json.dumps(bokeh.embed.json_item(p, "sentiment-box"))
	
@bp.route('/top-properties')
def top_properties():
	source_subreddit = request.args.get('source-subreddit')
	target_subreddit = request.args.get('target-subreddit')
	data = BodyModel.getInstance().get_top_properties(source_subreddit, target_subreddit)

	if source_subreddit and target_subreddit: 
		plot_title = f"Top properties of the subreddit - {source_subreddit} with target subreddit - {target_subreddit}"
	elif source_subreddit:
		plot_title = f"Top properties of the source subreddit - {source_subreddit}"		
	elif target_subreddit:
		plot_title = f"Top properties of the target subreddit - {target_subreddit}"
	else: 
		plot_title = "Top properties of all subreddits"
	
	p=figure(x_range=list(data.index), plot_height=300, plot_width=350, y_range=(0, 1), toolbar_location=None, tools="")
	p.vbar(x=list(data.index), top=list(data.values), width=0.9)
	p.xaxis.major_label_orientation = math.pi/2
	p.title.text = plot_title

	return json.dumps(bokeh.embed.json_item(p, "top_properties"))

@bp.route('/source-target-frequencies')
def plot_source_target_frequencies():
	num = int(request.args.get('num', default="20"))
	source_subreddit = request.args.get('source-subreddit')
	data = BodyModel.getInstance().get_frequency(source_subreddit)
	
	if source_subreddit is None:
		raise ValueError("Cannot load frequency plot for the entire data set. A source_subreddit as a query parameter is mandatory.")

	sorted_dict = sorted(data.items(), key=lambda x:x[1], reverse=True)
	target_subreddits, frequencies = zip(*sorted_dict)

	p = figure(x_range=target_subreddits[:num], plot_height=300, plot_width=350, title=f"Subreddit source: {source_subreddit}",
               toolbar_location=None, tools="")
	
	p.vbar(x=target_subreddits, top=frequencies, width=0.9)
	p.xgrid.grid_line_color = None
	p.y_range.start = 0
	p.xaxis.major_label_orientation = pi/4
	
	return json.dumps(bokeh.embed.json_item(p, "source_target_frequencies"))

@bp.route("/network")
def network():
	"""Returns the network graph data.
	Format: {
		"nodes": [
			"trendingsubreddits", 
			"streetfighter",
			"changelog",
			"sf4"
		]
		"links": [
			["trendingsubreddits", "changelog", 548], 
			["streetfighter", "sf4", 279], 
		]
	}
	Returns:
		str: json string
	"""
	n_links = int(request.args.get('n_links', default="20"))
	data = BodyModel.getInstance().get_network_data(n_links=n_links)
	network_graph = NetworkGraphHelper.to_network_graph(data)
	return network_graph
