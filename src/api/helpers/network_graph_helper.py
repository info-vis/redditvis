import json

import pandas as pd


class NetworkGraphHelper:
    @staticmethod
    def to_network_graph(data: pd.DataFrame) -> str:
        """Transform the network data to output accepted by the network in the front end.

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

        # data = data.copy()
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

        """
        graphData: {
            "nodes":[
                {"id":"IAmA","group":10},
                {"id":"abc","group":9},
                {"id":"abc","group":8},
                {"id":"abc","group":7},
                {"id":"abc","group":6},
                {"id":"abc","group":5},
                {"id":"abc","group":4},
                {"id":"Funny","group":1}
            ],
            "links":[
                {"source":"IAmA","target":"Funny","value":1},
                {"source":"abc","target":"IAmA","value":100}
            ]
        },

        graphData: {
            "nodes":[
                ["IAmA"],
                ["pics"],
            ],
            "links":[
                ["IAmA","Funny",1],
                ["pics","Funny",3],
            ]
        },
        """
