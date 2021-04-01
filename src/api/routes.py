import json

from numpy.lib.function_base import average

import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import plotly.io as pio
from flask import abort, jsonify, request
from plotly import utils
from src.api import bp
from src.api.helpers.network_graph_helper import NetworkGraphHelper
from src.api.model.body_model import BodyModel


PLOT_BACKGROUND_COLOR = "rgba(255,255,255,0)"
PLOT_WIDTH = 350

network_graph_helper = NetworkGraphHelper()

@bp.errorhandler(404)
def resource_not_found(e):
    return jsonify(error=str(e)), 404

@bp.route('/sentiment-box')
def sentiment_box():
	source_subreddit = request.args.get('source-subreddit')
	target_subreddit = request.args.get('target-subreddit')

	if source_subreddit is None and target_subreddit is None:
		raise ValueError("Cannot load sentiments for the entire data set. A source-subreddit or target-subreddit as a query parameter is mandatory.")
	
	sentiments = BodyModel.get_instance().get_sentiments(target_subreddit, source_subreddit)
  
	return jsonify(sentiments)

@bp.route('/top-properties')
def top_properties():
	source_subreddit = request.args.get('source-subreddit')
	target_subreddit = request.args.get('target-subreddit')
	data = BodyModel.get_instance().get_top_properties(source_subreddit, target_subreddit)
	data_intermediate = BodyModel.get_instance().get_top_properties_average()
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
		width=PLOT_WIDTH,
		height=300,
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
		margin={"t": 0},
		paper_bgcolor=PLOT_BACKGROUND_COLOR
	)

	return json.dumps(fig, cls=utils.PlotlyJSONEncoder)

@bp.route('/average-sentiment')
def average_sentiment():
	
	source_subreddit = request.args.get('source-subreddit')
	target_subreddit = request.args.get('target-subreddit')

	if source_subreddit is None and target_subreddit is None:
		raise ValueError("Cannot load average sentiments for the entire data set. A source-subreddit or target-subreddit as a query parameter is mandatory.")
	
	average = BodyModel.get_instance().get_average_sentiments(target_subreddit, source_subreddit)
  
	return jsonify(average)

@bp.route('/source-target-frequencies')
def plot_source_target_frequencies():
    source_subreddit = request.args.get('source-subreddit')
    target_subreddit = request.args.get('target-subreddit')
    data = BodyModel.get_instance().get_frequency(source_subreddit, target_subreddit)


    fig = go.Figure([go.Bar(
        x=data.values,
        y=data.index,
        orientation='h',
        showlegend=False,
        marker_color='rgb(64, 138, 207)'
    )])

    fig.update_yaxes(autorange="reversed")
    fig.update_layout(
        width=PLOT_WIDTH,
        height=300,
        dragmode=False,
        xaxis={"title": 'Number of posts'},
        font={"size": 9},
		margin={"t": 0},
		paper_bgcolor=PLOT_BACKGROUND_COLOR
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
	subreddit = request.args.get('subreddit')
	if subreddit:
		try:
			data = BodyModel.get_instance().get_subgraph_for_subreddit(subreddit)
		except KeyError:
			abort(404, description="Resource not found")
	else:
		data = BodyModel.get_instance().get_network_data(n_links=n_links)
	network_graph = network_graph_helper.to_network_graph(data)
	return jsonify(network_graph)

@bp.route("/properties-radar")
def properties_radar():
	source_subreddit = request.args.get('source-subreddit')
	target_subreddit = request.args.get('target-subreddit')
	data = BodyModel.get_instance().get_properties_radar(source_subreddit, target_subreddit)
	data_avg = BodyModel.get_instance().get_properties_radar_average()

	data_close_line = data.append(data.head(1))
	data_avg_close_line = data_avg.append(data_avg.head(1))

	fig = go.Figure(layout=go.Layout(height=300, width=PLOT_WIDTH - 50))

	fig.add_trace(go.Scatterpolar(
		r=data_close_line.values,
		theta=data_close_line.index,
		line_color='rgb(64, 138, 207)',
		showlegend=False, 
		name="Selection"
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
				"range":[0, 0.25]
				}
		},
		dragmode=False,
		showlegend=True,
		legend={
			"orientation":"h",
			"yanchor":"bottom",
			"y":0,
			"xanchor":"right",
			"x":1.2
		},
		font={"size": 9},
		margin={"t": 0},
		paper_bgcolor=PLOT_BACKGROUND_COLOR
	)

	fig.update_polars(radialaxis_tickformat="0.1%", radialaxis_tickvals=[0, 0.05, 0.10, 0.15, 0.20])

	return json.dumps(fig, cls=utils.PlotlyJSONEncoder)

@bp.route("/correlation")
def correlation_plot():
	source_subreddit = request.args.get('source-subreddit')
	target_subreddit = request.args.get('target-subreddit')
	x_axis_property = request.args.get('x-axis-property', 'Fraction of alphabetical characters')
	y_axis_property = request.args.get('y-axis-property', 'Automated readability index')

	data = BodyModel.get_instance().get_correlation_data(
		x_axis_property,
		y_axis_property,
		source_subreddit,
		target_subreddit
	)

	fig = px.scatter(
		data,
		x=data[x_axis_property],
		y=data[y_axis_property],
		opacity=0.4,
		trendline="ols",
		trendline_color_override="rgb(0, 62, 120)"
	)

	fig.update_traces(marker={"color":"rgb(64, 138, 207)"})
	fig.update_layout(
		width=PLOT_WIDTH,
		height=250,
		font={'size':9},
		margin={"t": 0},
		paper_bgcolor=PLOT_BACKGROUND_COLOR
	)
	
	return json.dumps(fig, cls=utils.PlotlyJSONEncoder)

@bp.route("/aggregates")
def aggregates():
	source_subreddit = request.args.get('source-subreddit')
	target_subreddit = request.args.get('target-subreddit')
	if (source_subreddit is None and target_subreddit is None):
		data = BodyModel.get_instance().get_global_aggregates()
		return jsonify({
			"data": data.to_dict(),
			"data_avg": data.to_dict()
		})
	data = BodyModel.get_instance().get_aggregates(source_subreddit, target_subreddit)
	average_data = BodyModel.get_instance().get_global_aggregates()
	return jsonify({
		"data": data.to_dict(),
		"data_avg": average_data.to_dict()
	})
