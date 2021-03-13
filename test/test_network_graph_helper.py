import pandas as pd
from api.helpers.network_graph_helper import NetworkGraphHelper

def test_to_network_graph():
    expected = {
        "links": [
          ['a', 'b', 1],
          ['a', 'c', 1],
          ['a', 'd', 1],
          ['c', 'e', 1],
        ],
        "nodes": [
          ['a', 1, 'parent'],
          ['b', 1, 'child'],
          ['c', None, None],
          ['d', 1, 'child'],
          ['e', None, None],
        ]
    }
    input = pd.DataFrame([
        ['a','b', 1],
        ['a','c', 1],
        ['a','d', 1],
        ['c','e', 1],
    ], columns=["SOURCE_SUBREDDIT", "TARGET_SUBREDDIT", "count"])
    actual = NetworkGraphHelper.to_network_graph(input)
    assert actual == expected
