import pandas as pd
import numpy as np
import collections
import networkx as nx
from pandas.core.common import flatten


class NetworkGraphHelper:
    """This class helps to with data formatting for the network graph.
    """
    @staticmethod
    def to_network_graph(data: pd.DataFrame) -> dict:
        def to_nodes(data):
            unique_sources = pd.DataFrame(data.iloc[:, 0].unique())
            unique_targets = pd.DataFrame(data.iloc[:, 1].unique())
            nodes = pd.concat([unique_sources, unique_targets])[0].unique()

            return nodes

        def to_links(data):
            return data.rename(columns={
                "SOURCE_SUBREDDIT": "source",
                "TARGET_SUBREDDIT": "target",
                "count": "value",
            })

        nodes = to_nodes(data)
        links = to_links(data)


        def cluster_nodes(nodes, links):
            def get_links(node, links):
                return links[(links['source'] == node) | (links['target'] == node)]
  
            newNodes = []
            for node in nodes:
                links_of_node = get_links(node, links)
                neighbors = [x for x in to_nodes(links_of_node) if x != node]
                if (len(neighbors) == 1):
                    indexOfParent = np.where(nodes == neighbors[0])[0][0]
                    newNodes.append([node, 'child', int(indexOfParent)])
                else:
                    newNodes.append([node, 'unknown'])
            
            childNodes = [x for x in newNodes if x[1] == 'child']
            nonChildNodes = [x for x in newNodes if x[1] == 'unknown']
            parentNodes = []
            singleNodes = []
            for node in nonChildNodes:
                links_of_node = get_links(node[0], links)
                neighbors = to_nodes(links_of_node)
                isParent = False
                for neighbor in neighbors:
                    neighborIsChild = neighbor in [x[0] for x in childNodes]
                    if neighborIsChild:
                        indexOfParent = np.where(nodes == node[0])[0][0]
                        parentNodes.append([node[0], 'parent', int(indexOfParent)])
                        isParent = True
                        break
                if (not isParent):
                    singleNodes.append([node[0], None, None])
            return parentNodes + childNodes + singleNodes

        return {"nodes": cluster_nodes(nodes, links), "links": links.values.tolist()}



    @staticmethod
    def to_network_graph2(data: pd.DataFrame, graph, subreddit) -> dict:
        def to_links(data):
            return data.rename(columns={
                "SOURCE_SUBREDDIT": "source",
                "TARGET_SUBREDDIT": "target",
                "count": "value",
            })

        def get_subgraph(subreddit, graph):
            neighbors = [x for x in nx.all_neighbors(graph, subreddit)]
            neighbors.append(subreddit)

            nn = []
            for neigh in neighbors:
                temp = [x for x in nx.all_neighbors(graph, neigh)]
                print(f"neighbors for {neigh}: ", temp)
                nn += temp

            nn += neighbors
            nn = set(nn)
            print('nn:', nn)
            result = nx.subgraph(graph, nn)
            return result


        def cluster(subgraph):
            clusters = collections.defaultdict(list)
            for node in subgraph:
                neighbors = [x for x in nx.all_neighbors(subgraph, node)]
                if len(neighbors) == 1:
                    # child found
                    key = neighbors[0]
                    clusters[key].append(node)
            
            result = []
            group_id = 1
            for parent, children in clusters.items():
                result.append([parent, "parent", group_id]) # Parent
                result += [[c, "child", group_id] for c in children] #child
                group_id += 1
                
            nodes = [x for x in subgraph]
            parents_or_children = list(clusters.keys()) + list(flatten(clusters.values()))
            result += [[x, None, None] for x in nodes if x not in parents_or_children]

            return result

        subgraph = get_subgraph(subreddit, graph)
        print('subgraph')
        print([x for x in subgraph])
        print(nx.info(subgraph))
        clusters = cluster(subgraph)
        return {"nodes": clusters, "links": to_links(data).values.tolist()}