import json

import pandas as pd


class NetworkGraphHelper:
    """This class helps to with data formatting for the network graph.
    """
    @staticmethod
    def to_network_graph(data: pd.DataFrame) -> str:
        """Transform the network data from a pandas df to the format 
        accepted by the network in the front end.

        Args:
            data (pd.DataFrame): In the format:
                    SOURCE_SUBREDDIT    TARGET_SUBREDDIT  count
            128037  trendingsubreddits        changelog    548
            114895       streetfighter              sf4    279
        
        Returns:
            str: JSON string in the format:
            {
                "nodes":[
                    ["trendingsubreddits"],
                    ["streetfighter"],
                    ["changelog"],
                    ["sf4"],
                ],
                "links":[
                    ["trendingsubreddits","changelog",548],
                    ["streetfighter","sf4",279],
                ]
            }
        """

        def to_nodes(data):
            unique_sources = pd.DataFrame(data["SOURCE_SUBREDDIT"].unique())
            unique_targets = pd.DataFrame(data["TARGET_SUBREDDIT"].unique())
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
        return json.dumps({
            "nodes": list(nodes), 
            "links": links.values.tolist()
        })
