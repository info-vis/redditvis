import collections

import networkx as nx
import numpy as np
import pandas as pd
from pandas.core.common import flatten


class NetworkGraphHelper:
    """This class helps to with data formatting for the network graph."""

    @staticmethod
    def to_network_graph(data: pd.DataFrame) -> dict:
        def to_links(data):
            return data[
                ["SOURCE_SUBREDDIT", "TARGET_SUBREDDIT", "count"]
            ].values.tolist()

        def to_nodes_with_cluster():
            """Add cluster data to nodes.

            Returns:
                list: ['subreddit_name', 'type', 'cluster_id']
                    Example: ['iama', 'parent', 1], ['books', 'child', 1], ['ducks', None, None]
            """
            graph = nx.from_pandas_edgelist(
                data, "SOURCE_SUBREDDIT", "TARGET_SUBREDDIT", create_using=nx.DiGraph()
            )
            # Contains parents as key, list of children as values
            clusters = collections.defaultdict(list) # Create a dict where each key has an empty list by default
            for node in graph:
                neighbors = [x for x in nx.all_neighbors(graph, node)]
                is_leaf_node = len(set(neighbors)) == 1 # Only one unique neighbor? Leaf node (child) found
                if is_leaf_node:
                    key = neighbors[0]  # Key = parent
                    clusters[key].append(node)  # Add the node to the child array of the parent

            result = []
            cluster_id = 1
            for parent, children in clusters.items():
                result.append([parent, "parent", cluster_id])  # Parent
                result += [[c, "child", cluster_id] for c in children]  # Child
                cluster_id += 1

            nodes = [x for x in graph]  # All nodes in the graph
            parents_or_children = list(clusters.keys()) + list(
                flatten(clusters.values())
            )
            # Add nodes without cluster properties (None, None) when they are neither parents nor children
            result += [[x, None, None] for x in nodes if x not in parents_or_children]
            return result

        nodes = to_nodes_with_cluster()
        links = to_links(data)
        return {"nodes": nodes, "links": links}
