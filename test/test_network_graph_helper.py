import pandas as pd
from api.helpers.network_graph_helper import NetworkGraphHelper

def test_to_network_graph():
    expected = {
        'nodes': [
            ['a', 'parent', 0], 
            ['e', 'parent', 2], 
            ['b', 'child', 0], 
            ['d', 'child', 0], 
            ['f', 'child', 2], 
            ['c', None, None]
        ],
        "links": [
          ['a', 'b', 1],
          ['a', 'c', 1],
          ['a', 'd', 1],
          ['c', 'e', 1],
          ['e', 'f', 1],
        ]
    }
    input_data = pd.DataFrame([
        ['a','b', 1],
        ['a','c', 1],
        ['a','d', 1],
        ['c','e', 1],
        ['e','f', 1]
    ], columns=["SOURCE_SUBREDDIT", "TARGET_SUBREDDIT", "count"])
    actual = NetworkGraphHelper.to_network_graph(input_data)
    assert actual == expected
