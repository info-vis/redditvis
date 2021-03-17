import json
import math
from math import pi

import bokeh
import numpy as np
from bokeh.plotting import figure
from flask import request
from src.api import bp
from src.api.helpers.network_graph_helper import NetworkGraphHelper
from src.api.model.body_model import BodyModel


@bp.route('/sentiment-box')
def sentiment_box():
	
	source_subreddit = request.args.get('source-subreddit')
	target_subreddit = request.args.get('target-subreddit')

	if source_subreddit is None and target_subreddit is None:
		raise ValueError("Cannot load sentiments for the entire data set. A source-subreddit or target-subreddit as a query parameter is mandatory.")
	
	sentiments = BodyModel.getInstance().get_sentiments(target_subreddit, source_subreddit)
  
	return json.dumps(sentiments)

@bp.route('/top-properties')
def top_properties():
	source_subreddit = request.args.get('source-subreddit')
	target_subreddit = request.args.get('target-subreddit')
	data = BodyModel.getInstance().get_top_properties(source_subreddit, target_subreddit)
	data_avg = BodyModel.getInstance().get_top_properties_average()

	p = figure(y_range=list(reversed(data.index)), plot_height=300, plot_width=350, x_range=(0, 0.5), toolbar_location=None, tools="")
	p.hbar(y=list(data.index), right=list(data.values), left=0, height=0.9)
	p.asterisk(y=list(data_avg.index), x=list(data_avg.values), color="midnightblue", legend_label="Avg. of all subreddits",)
	p.ygrid.grid_line_color = None
	p.legend.location = "bottom_right"

	return json.dumps(bokeh.embed.json_item(p, "top_properties"))

@bp.route('/average-sentiment')
def average_sentiment():
	
	source_subreddit = request.args.get('source-subreddit')
	target_subreddit = request.args.get('target-subreddit')

	if source_subreddit is None and target_subreddit is None:
		raise ValueError("Cannot load average sentiments for the entire data set. A source-subreddit or target-subreddit as a query parameter is mandatory.")
	
	average = BodyModel.getInstance().get_average_sentiments(target_subreddit, source_subreddit)
  
	return json.dumps(average)

@bp.route('/source-target-frequencies')
def plot_source_target_frequencies():
	num = int(request.args.get('num', default="20"))
	source_subreddit = request.args.get('source-subreddit')
	data = BodyModel.getInstance().get_frequency(source_subreddit)
	
	if source_subreddit is None:
		raise ValueError("Cannot load frequency plot for the entire data set. A source_subreddit as a query parameter is mandatory.")

	sorted_dict = sorted(data.items(), key=lambda x:x[1], reverse=True)
	target_subreddits, frequencies = zip(*sorted_dict)

	p = figure(x_range=target_subreddits[:num], plot_height=300, plot_width=350,
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
