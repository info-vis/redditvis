import json
import math
from math import pi

import bokeh
import numpy as np
import plotly.graph_objects as go
from bokeh.models import NumeralTickFormatter
from bokeh.plotting import figure
from flask import request
from src.api import bp
from src.api.helpers.network_graph_helper import NetworkGraphHelper
from src.api.model.body_model import BodyModel
import plotly.io as pio
from plotly import utils

@bp.route('/sentiment-box')
def sentiment_box():
	source_subreddit = request.args.get('source-subreddit')

	if source_subreddit is None:
		raise ValueError("Cannot load sentiments for the entire data set. A source-subreddit as a query parameter is mandatory.")
	
	sentiments = BodyModel.getInstance().get_sentiments(source_subreddit)

	p = figure(plot_width=350, plot_height=100, tools ='') # The width and height may have to change
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
	data_avg = BodyModel.getInstance().get_top_properties_average()

	p = figure(y_range=list(reversed(data.index)), plot_height=300, plot_width=350, x_range=(0, 0.10), toolbar_location=None, tools="")
	p.hbar(y=list(data.index), right=list(data.values), left=0, height=0.9)
	p.asterisk(y=list(data_avg.index), x=list(data_avg.values), color="midnightblue", legend_label="Avg. of all subreddits",)
	p.ygrid.grid_line_color = None
	p.legend.location = "bottom_right"
	p.legend.background_fill_alpha = 0.2
	p.legend.border_line_alpha = 0.5
	p.legend.label_text_font_size = '8pt'
	p.xaxis[0].formatter = NumeralTickFormatter(format="0.0%")
	p.xaxis.minor_tick_line_color = None
	p.xaxis.axis_label = "% of all words in the post"
	
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

@bp.route("/properties-radar")
def properties_radar():
	source_subreddit = request.args.get('source-subreddit')
	target_subreddit = request.args.get('target-subreddit')
	data = BodyModel.getInstance().get_properties_radar(source_subreddit, target_subreddit)
	data_avg = BodyModel.getInstance().get_properties_radar_average()
	
	data_close_line = data.append(data.head(1))
	data_avg_close_line=data_avg.append(data_avg.head(1))

	fig = go.Figure(layout=go.Layout(height=400, width=400))

	fig.add_trace(go.Scatterpolar(
		r=data_close_line.values,
		theta=data_close_line.index,
		line_color="blue",
		showlegend=False
	))

	fig.add_trace(go.Scatterpolar(
		r=data_avg_close_line.values,
		theta=data_avg_close_line.index,
		line_color="red",
		name='Avg. of all subreddits'
	))

	fig.update_layout(
	polar = dict(
		radialaxis=dict(
			visible=True,
			range=[0, 0.15],),
		),
	dragmode = False,
	showlegend=True,
	legend=dict(
		orientation="h",
		yanchor="bottom",
		y=-0.2,
		xanchor="right",
		x=1.2
		), 
	)
	
	fig.update_polars(radialaxis_tickformat="0.1%", radialaxis_tickvals=[0, 0.05, 0.10, 0.15])

	return json.dumps(fig, cls=utils.PlotlyJSONEncoder)
