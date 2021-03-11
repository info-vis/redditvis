import json
import math
from math import pi

import bokeh
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import plotly.io as pio
from bokeh.models import NumeralTickFormatter
from bokeh.plotting import figure
from flask import request
from plotly import utils
from src.api import bp
from src.api.helpers.network_graph_helper import NetworkGraphHelper
from src.api.model.body_model import BodyModel


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
	data_intermediate = BodyModel.getInstance().get_top_properties_average()
	data_avg = data_intermediate[data.index]

	fig = go.Figure()

	fig.add_trace(
		go.Bar(
			x=data.values,
			y=data.index, 
			orientation='h',
			showlegend=False,
			marker_color='rgb(64, 138, 207)',
			name="Selection"
		))

	fig.add_trace(
		go.Scatter(
			x=data_avg.values,
			y=data.index, 
			mode="markers",
			name='Avg. of all subreddits',
			marker_color='rgb(0, 62, 120)',
			marker_symbol="diamond"
		))

	fig.update_yaxes(autorange="reversed")
	fig.update_layout(
		width=400,
		height=400,
		dragmode=False,
		xaxis={
			"tickformat":'0.1%',
			"title":'% of all words in the post',
			"range":[0,0.1],
			"dtick":0.025
		},
		legend={
			"orientation":"h",
			"yanchor":"bottom",
			"y":0.01,
			"xanchor":"right",
			"x":0.99,
			"bgcolor":'rgba(0,0,0,0)',
			"bordercolor":"LightSteelBlue",
			"borderwidth":0.5
			},
		font={"size": 9},
		margin={"t": 0}
	)
		
	return json.dumps(fig, cls=utils.PlotlyJSONEncoder)

@bp.route('/source-target-frequencies')
def plot_source_target_frequencies():
    source_subreddit = request.args.get('source-subreddit')
    target_subreddit = request.args.get('target-subreddit')
    data = BodyModel.getInstance().get_frequency(source_subreddit, target_subreddit)


    fig = go.Figure([go.Bar(
        x=data.values,
        y=data.index, 
        orientation='h', 
        showlegend=False, 
        marker_color='rgb(64, 138, 207)'
    )])

    fig.update_yaxes(autorange="reversed")
    fig.update_layout(
        width=500,
        height=400,
        dragmode=False,
        xaxis={"title": 'Number of posts'}, 
        font={"size": 9},
		margin={"t": 0}
	)

    return json.dumps(fig, cls=utils.PlotlyJSONEncoder)

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
	data_avg_close_line = data_avg.append(data_avg.head(1))

	fig = go.Figure(layout=go.Layout(height=400, width=400))

	fig.add_trace(go.Scatterpolar(
		r=data_close_line.values,
		theta=data_close_line.index,
		line_color='rgb(64, 138, 207)',
		showlegend=False
	))

	fig.add_trace(go.Scatterpolar(
		r=data_avg_close_line.values,
		theta=data_avg_close_line.index,
		line_color='rgb(0, 62, 120)',
		name='Avg. of all subreddits'
	))

	fig.update_layout(
		polar =
			{"radialaxis": {
				"visible":True,
				"range":[0, 0.15]
				}
		},
		dragmode=False,
		showlegend=True,
		legend={
			"orientation":"h",
			"yanchor":"bottom",
			"y":-0.2,
			"xanchor":"right",
			"x":1.2
		},
		margin={"t": 0}
	)
	
	fig.update_polars(radialaxis_tickformat="0.1%", radialaxis_tickvals=[0, 0.05, 0.10, 0.15])

	return json.dumps(fig, cls=utils.PlotlyJSONEncoder)

@bp.route("/correlation")
def correlation_plot():
	source_subreddit = request.args.get('source-subreddit')
	target_subreddit = request.args.get('target-subreddit')
	data = BodyModel.getInstance().get_correlation_data(source_subreddit, target_subreddit)

	fig = px.scatter(data, x=data['FRACTION_OF_ALPHABETICAL_CHARS'], y=data['AUTOMATED_READIBILITY_INDEX'], opacity=0.4, trendline="ols", trendline_color_override="red")

	fig.update_traces(marker={"color":"green"})
	fig.update_layout(
		width=400,
		height=400,
		dragmode=False,
		font={'size':9})
		
	return json.dumps(fig, cls=utils.PlotlyJSONEncoder)


