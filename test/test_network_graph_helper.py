import networkx as nx
import pandas as pd
from api.helpers.network_graph_helper import NetworkGraphHelper


def test_to_network_graph():
    expected = {
        "nodes": [
            ["a", "parent", 1],
            ["b", "child", 1],
            ["i", "child", 1],
            ["d", "parent", 2],
            ["g", "child", 2],
            ["h", "parent", 3],
            ["j", "child", 3],
            ["f", "parent", 4],
            ["l", "child", 4],
            ["m", "child", 4],
            ["k", "parent", 5],
            ["n", "child", 5],
            ["c", None, None],
            ["e", None, None],
        ],
        "links": [
            ["a", "b", 1],
            ["a", "c", 1],
            ["a", "d", 1],
            ["a", "i", 1],
            ["c", "e", 1],
            ["e", "f", 1],
            ["d", "f", 1],
            ["g", "d", 1],
            ["h", "a", 1],
            ["h", "d", 1],
            ["i", "a", 1],
            ["j", "h", 1],
            ["k", "h", 1],
            ["f", "l", 1],
            ["m", "f", 1],
            ["n", "k", 1],
        ],
    }

    input_data = pd.DataFrame(
        [
            ["a", "b", 1],
            ["a", "c", 1],
            ["a", "d", 1],
            ["a", "i", 1],
            ["c", "e", 1],
            ["e", "f", 1],
            ["d", "f", 1],
            ["g", "d", 1],
            ["h", "a", 1],
            ["h", "d", 1],
            ["i", "a", 1],
            ["j", "h", 1],
            ["k", "h", 1],
            ["f", "l", 1],
            ["m", "f", 1],
            ["n", "k", 1],
        ],
        columns=["SOURCE_SUBREDDIT", "TARGET_SUBREDDIT", "count"],
    )
    actual = NetworkGraphHelper.to_network_graph(input_data)
    print("actual:", actual)
    print("expected:", expected)
    assert actual == expected
