import collections
import os
from datetime import datetime
from typing import Optional

import networkx as nx
import pandas as pd
from numpy.lib.utils import source
from src.api.helpers.body_data_transformer import BodyDataTransformer


class BodyModel:
    """Singleton object that can obtain data from the Reddit Body data set.
    This object should not be created using BodyModel() but via BodyModel.getInstance().
    This returns a reference to the singleton object.
    """
    BODY_DATA_PATH = os.getenv("BODY_DATA_PATH")
    NETWORK_BODY_DATA_PATH = BodyDataTransformer.OUTPUT_FILE_NAME
    AGGREGATE_COLUMNS = [
        'Automated readability index',
        'Average word length',
        'Average number of words per sentence'
    ]

    __instance = None # A reference to an instance of itself
    data = None       # The data loaded from BODY_DATA_PATH
    graph = None


    @staticmethod
    def get_instance():
        """Static access method. Returns a reference to the singleton object."""
        if BodyModel.__instance == None:
            BodyModel()
        return BodyModel.__instance

    def __init__(self):
        """Virtually private constructor. """
        if BodyModel.__instance != None:
            raise Exception("This class is a singleton. To create an object, call BodyModel.getInstance()")
        else:
            BodyModel.__instance = self
        self.data = pd.read_parquet(self.BODY_DATA_PATH, engine="pyarrow")
        self.network_data = pd.read_parquet(self.NETWORK_BODY_DATA_PATH, engine="pyarrow")

        result = self.data.groupby(["SOURCE_SUBREDDIT", "TARGET_SUBREDDIT"])\
                .size()\
                .reset_index()\
                .rename(columns={0: "count"})\
                .sort_values("count", ascending=False)
        self.graph = nx.from_pandas_edgelist(result, 'SOURCE_SUBREDDIT', 'TARGET_SUBREDDIT', create_using=nx.DiGraph())

    def get_top_target_subreddits(self, num):
        return self.data.groupby(["TARGET_SUBREDDIT"]).size().reset_index(name="counts") \
            .sort_values("counts", ascending=False).head(num)

    def get_sentiments(self, target_subreddit, source_subreddit):
        FIRST_DATE_IN_DATA_SET = '01-02-2014'
        LATEST_DATE_IN_DATA_SET = '12-31-2017'
        daterange = pd.date_range(FIRST_DATE_IN_DATA_SET, LATEST_DATE_IN_DATA_SET).astype(str)

        if target_subreddit is not None and source_subreddit is not None:
            intermediate = self.data.loc[(self.data['SOURCE_SUBREDDIT'] == source_subreddit) & (self.data['TARGET_SUBREDDIT'] == target_subreddit)].copy()
        elif source_subreddit is not None:
            intermediate = self.data.loc[self.data['SOURCE_SUBREDDIT'] == source_subreddit].copy()
        elif target_subreddit is not None:
            intermediate = self.data.loc[self.data['TARGET_SUBREDDIT'] == target_subreddit].copy()
        else:
            raise ValueError("source_subreddit and target_subreddit cannot both be None")

        intermediate.loc[:,'NUM_POSTS'] = intermediate.groupby('DATE')['DATE'].transform('count').fillna(0)     
        intermediate.loc[:,'SUM_SENTIMENT'] = intermediate.groupby('DATE')['LINK_SENTIMENT'].transform('sum')
        intermediate.loc[:, 'AVG_SENT_DAY'] = round(intermediate['SUM_SENTIMENT'].div(intermediate['NUM_POSTS']),4)

        intermediate = intermediate.sort_values(by=['DATE','TIMEOFDAY']).loc(axis=1)['DATE','AVG_SENT_DAY'].set_index('DATE')
        intermediate = intermediate[~intermediate.index.duplicated(keep='first')]

        intermediate = intermediate.reindex(daterange, fill_value = 0) \
                                .reset_index() \
                                .rename(columns={'index': 'DATE'}) 

        intermediate['year'] = intermediate["DATE"].apply(lambda x: datetime.strptime(x, "%Y-%m-%d").year)
        unique_years = intermediate["year"].unique()
        result = collections.defaultdict(list)
        for year in unique_years:
            result[str(year)] = intermediate[intermediate["year"] == year].loc[:, ["DATE", "AVG_SENT_DAY"]].to_dict('records')
        return result

    def get_average_sentiments(self, target_subreddit, source_subreddit):
        if target_subreddit != None and source_subreddit != None:
            result = self.data.loc[(self.data['SOURCE_SUBREDDIT'] == source_subreddit) & (self.data['TARGET_SUBREDDIT'] == target_subreddit)]
        elif source_subreddit != None:
            result = self.data.loc[self.data['SOURCE_SUBREDDIT'] == source_subreddit]
        elif target_subreddit != None:
            result = self.data.loc[self.data['TARGET_SUBREDDIT'] == target_subreddit]
        else:
            raise ValueError("source_subreddit and target_subreddit cannot both be None")
        
        result = result.loc[:,'LINK_SENTIMENT'].mean()
        return float(result)

    def get_top_properties(self, source_subreddit: Optional[str] = None, target_subreddit: Optional[str] = None):
        """Getting top 10 semantic properties of the post for the source subredddit, target subreddit or all subreddits.

        Args:
            source_subreddit (str, optional): The source subreddit you wish to get top properties for. Defaults to None.
            target_subreddit (str, optional): The target subreddit you wish to get top properties for. Defaults to None.

        Returns:
            pd.Series: Format:
            LIWC_Funct      0.256797
            LIWC_CogMech    0.100940
        """
        data = self.data
        if source_subreddit is not None and target_subreddit is not None:
            data = self.data[(self.data['SOURCE_SUBREDDIT'] == source_subreddit) & (self.data['TARGET_SUBREDDIT'] == target_subreddit)]
        elif source_subreddit is not None:
            data = self.data[self.data["SOURCE_SUBREDDIT"] == source_subreddit]
        elif target_subreddit is not None:
            data = self.data[self.data["TARGET_SUBREDDIT"] == target_subreddit]
        return data.loc[:,['Swear words','Family', 'Friends', 'Humans', 'Positive emotions', 'Negative emotions', 'Anxiety', 'Anger', 'Sadness', 'Insight', 'Causation', 'Discrepancy', 'Tentative', 'Certainty', 'Inhibition', 'Inclusive', 'Exclusive', 'Seeing', 'Hearing', 'Feeling', 'Body', 'Health', 'Sexuality', 'Ingestion', 'Motion', 'Space', 'Time', 'Work', 'Achievement', 'Leisure', 'Home', 'Money', 'Religion', 'Death']].mean().sort_values(ascending=False).head(10)
    
    def get_top_properties_average(self):
        data = self.data.loc[:,"Swear words":"Death"].mean()
        return data

    def get_frequency(self, source_subreddit: Optional[str] = None, target_subreddit: Optional[str] = None):
        if source_subreddit is not None and target_subreddit is not None:
            return self.data.loc[(self.data['SOURCE_SUBREDDIT'] == source_subreddit) & (self.data['TARGET_SUBREDDIT'] == target_subreddit)].groupby(["TARGET_SUBREDDIT"]).size().head(1)
        elif source_subreddit is not None:
            return self.data.loc[self.data['SOURCE_SUBREDDIT'] == source_subreddit].groupby(['TARGET_SUBREDDIT']) \
                .size().sort_values(ascending=False).head(10)
        elif target_subreddit is not None:
            return self.data.loc[self.data['TARGET_SUBREDDIT'] == target_subreddit].groupby(['SOURCE_SUBREDDIT']) \
                .size().sort_values(ascending=False).head(10)
        return self.data.groupby(['SOURCE_SUBREDDIT'])['TARGET_SUBREDDIT'].size().sort_values(ascending=False).head(10)

    def get_network_data(self, n_links: Optional[int] = None) -> pd.DataFrame:
        """Returns the network data.

        Args:
            n_links (int, optional): number of links. Defaults to None.

        Returns:
            pd.DataFrame: Format:
                    SOURCE_SUBREDDIT    TARGET_SUBREDDIT  count
            128037  trendingsubreddits        changelog    548
            114895       streetfighter              sf4    279
        """
        if n_links is not None:
            return self.network_data.head(n_links)
        return self.network_data

    def get_subgraph_for_subreddit(self, subreddit: str, min_count = 5) -> pd.DataFrame:
        """Returns the a subgraph of the network data with a depth of 1, i.e. all incoming and
        outgoing edges of the subreddit.

        Args:
            subreddit (str): The subreddit to retrieve the subgraph for
            min_count (int): The minimum number of rows that need to exist in the data set
                in order for the source/target relation to be returned.

        Returns:
            pd.DataFrame: Format (subreddit = "changelog"):
                    SOURCE_SUBREDDIT    TARGET_SUBREDDIT  count
                    117	trendingsubreddits	changelog	548
                    17	changelog	beta	7
                    30	changelog	redditdev	7
        """
        ######## v3 begin ########
        df = self.network_data
        
        def get_neighbors(subreddit, graph):
            neighbors = list(nx.all_neighbors(graph, subreddit))
            return set(neighbors)

        neighbors = get_neighbors(subreddit, self.graph)
        
        subreddit_neighbors_df = df[(df["SOURCE_SUBREDDIT"] == subreddit) | (df["TARGET_SUBREDDIT"] == subreddit)]
        neighbors_neighbors_df = df[(df["SOURCE_SUBREDDIT"].isin(neighbors)) | (df["TARGET_SUBREDDIT"].isin(neighbors))]
        # Reduce size
        neighbors_neighbors_df = neighbors_neighbors_df[neighbors_neighbors_df['count'] > min_count]

        return pd.concat([subreddit_neighbors_df, neighbors_neighbors_df])
        ######## v3 end ########

        ######## v2 begin ########
        # if self.data is None:
        #     raise ValueError("No data has been loaded in BodyModel.")

        # return self.data[(self.data["SOURCE_SUBREDDIT"] == subreddit) | (self.data["TARGET_SUBREDDIT"] == subreddit)]\
        #     .groupby(["SOURCE_SUBREDDIT", "TARGET_SUBREDDIT"])\
        #     .size()\
        #     .reset_index()\
        #     .rename(columns={0: "count"})\
        #     .sort_values("count", ascending=False)
        ######## v2 end ########

    def get_properties_radar(self, source_subreddit: Optional[str] = None, target_subreddit: Optional[str] = None):
        data = self.data
        if source_subreddit is not None and target_subreddit is not None:
            data = self.data[(self.data['SOURCE_SUBREDDIT'] == source_subreddit) & (self.data['TARGET_SUBREDDIT'] == target_subreddit)]
        elif source_subreddit is not None:
            data = self.data[self.data["SOURCE_SUBREDDIT"] == source_subreddit]
        elif target_subreddit is not None:
            data = self.data[self.data["TARGET_SUBREDDIT"] == target_subreddit]
        return data.loc[:,["Social processes", "Affective processes", "Cognitive processes", "Relativity", "Biological processes", "Perceptual processes"]].mean()

    def get_properties_radar_average(self):
        data = self.data.loc[:,["Social processes", "Affective processes", "Cognitive processes", "Relativity", "Biological processes", "Perceptual processes"]].mean()
        return data

    def get_correlation_data(
        self,
        property1: str,
        property2: str,
        source_subreddit: Optional[str] = None,
        target_subreddit: Optional[str] = None
    ):

        data = self.data
        if source_subreddit is not None and target_subreddit is not None:
            data = self.data[(self.data['SOURCE_SUBREDDIT'] == source_subreddit) & (self.data['TARGET_SUBREDDIT'] == target_subreddit)]
        elif source_subreddit is not None:
            data = self.data[self.data["SOURCE_SUBREDDIT"] == source_subreddit]
        elif target_subreddit is not None:
            data = self.data[self.data["TARGET_SUBREDDIT"] == target_subreddit]
        return data[[property1, property2]]

    def get_aggregates(self, source_subreddit: Optional[str] = None, target_subreddit: Optional[str] = None):
        if source_subreddit is not None and target_subreddit is not None:
            intermediate = self.data[
                (self.data['SOURCE_SUBREDDIT'] == source_subreddit) \
                    & (self.data['TARGET_SUBREDDIT'] == target_subreddit)
            ]
            num_of_posts = intermediate.groupby(["SOURCE_SUBREDDIT", "TARGET_SUBREDDIT"]).size()[0]
        elif source_subreddit is not None:
            intermediate = self.data[self.data["SOURCE_SUBREDDIT"] == source_subreddit]
            num_of_posts = intermediate.groupby("SOURCE_SUBREDDIT").size()[0]
        elif target_subreddit is not None:
            intermediate = self.data[self.data["TARGET_SUBREDDIT"] == target_subreddit]
            num_of_posts = intermediate.groupby("TARGET_SUBREDDIT").size()[0]

        result = intermediate.loc[:, self.AGGREGATE_COLUMNS].mean().round(decimals=2)
        result["Number of posts"] = num_of_posts
        result["Positive posts"] = intermediate.loc[(intermediate["LINK_SENTIMENT"]==1)].groupby(["LINK_SENTIMENT"]).size()[1]
        result["Negative posts"] = intermediate.loc[(intermediate["LINK_SENTIMENT"]== -1)].groupby(["LINK_SENTIMENT"]).size()[-1]
        if result["Negative posts"] == KeyError:
            result["Negative posts"] = 0
        # else:
            # result["Negative posts"] = result["Negative posts"][0]

        return result

    def get_global_aggregates(self):
        """Returns the global aggregates over various properties.
        """
        result = self.data.loc[:, self.AGGREGATE_COLUMNS].mean().round(decimals=2)
        result["Number of posts"] = self.data.shape[0]
        result["Positive posts"] = self.data.loc[(self.data["LINK_SENTIMENT"]==1)].groupby(["LINK_SENTIMENT"]).size()[1]
        result["Negative posts"] = self.data.loc[(self.data["LINK_SENTIMENT"]==-1)].groupby(["LINK_SENTIMENT"]).size()[-1]
        return result       
