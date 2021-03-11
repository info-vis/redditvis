import os
from typing import Optional

import pandas as pd


class BodyModel:
    """Singleton object that can obtain data from the Reddit Body data set.
    This object should not be created using BodyModel() but via BodyModel.getInstance().
    This returns a reference to the singleton object.
    """
    BODY_DATA_PATH = os.getenv("BODY_DATA_PATH")

    __instance = None # A reference to an instance of itself
    data = None       # The data loaded from BODY_DATA_PATH

    @staticmethod 
    def getInstance():
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

    def get_sentiments(self, target):
        posts_for_target = self.data.loc[self.data['TARGET_SUBREDDIT'] == target]
        posts_for_target = posts_for_target.sort_values(by=['DATE','TIMEOFDAY'])
        sentiments = list(posts_for_target['LINK_SENTIMENT'])
        return sentiments 
        
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
        return data.loc[:,['LIWC_Family', 'LIWC_Friends', 'LIWC_Humans', 'LIWC_Posemo', 'LIWC_Negemo', 'LIWC_Anx', 'LIWC_Anger', 'LIWC_Sad', 'LIWC_Insight', 'LIWC_Cause', 'LIWC_Discrep', 'LIWC_Tentat', 'LIWC_Certain', 'LIWC_Inhib', 'LIWC_Incl', 'LIWC_Excl', 'LIWC_See', 'LIWC_Hear', 'LIWC_Feel', 'LIWC_Body', 'LIWC_Health', 'LIWC_Sexual', 'LIWC_Ingest', 'LIWC_Motion', 'LIWC_Space', 'LIWC_Time', 'LIWC_Work', 'LIWC_Achiev', 'LIWC_Leisure', 'LIWC_Home', 'LIWC_Money', 'LIWC_Relig', 'LIWC_Death']].mean().sort_values(ascending=False).head(10)
    
    def get_top_properties_average(self):
        data = self.data.loc[:,"LIWC_Funct":"LIWC_Filler"].mean()
        return data

    def get_frequency(self, source_subreddit: Optional[str] = None, target_subreddit: Optional[str] = None):
        if source_subreddit is not None:
            return self.data.loc[self.data['SOURCE_SUBREDDIT'] == source_subreddit].groupby(['TARGET_SUBREDDIT']) \
                .size().sort_values(ascending=False).head(10)
        elif target_subreddit is not None:
            return self.data.loc[self.data['TARGET_SUBREDDIT'] == target_subreddit].groupby(['SOURCE_SUBREDDIT']) \
                .size().sort_values(ascending=False).head(10)
        return self.data.groupby(['SOURCE_SUBREDDIT'])['TARGET_SUBREDDIT'].size().sort_values(ascending=False).head(10)

            

    def get_network_data(self, n_links: Optional[int] = None) -> pd.DataFrame:
        """Returns the network data.

        Args:
            head (int, optional): number of links. Defaults to None.

        Returns:
            pd.DataFrame: Format:
                    SOURCE_SUBREDDIT    TARGET_SUBREDDIT  count
            128037  trendingsubreddits        changelog    548
            114895       streetfighter              sf4    279
        """
        if self.data is None:
            raise ValueError("No data has been loaded in BodyModel.")
        result = self.data.groupby(["SOURCE_SUBREDDIT", "TARGET_SUBREDDIT"])\
                .size()\
                .reset_index()\
                .rename(columns={0: "count"})\
                .sort_values("count", ascending=False)
        if n_links is not None:
            return result.head(n_links)
        return result


    def get_properties_radar(self, source_subreddit: Optional[str] = None, target_subreddit: Optional[str] = None):
        data = self.data
        if source_subreddit is not None and target_subreddit is not None:
            data = self.data[(self.data['SOURCE_SUBREDDIT'] == source_subreddit) & (self.data['TARGET_SUBREDDIT'] == target_subreddit)]
        elif source_subreddit is not None:
            data = self.data[self.data["SOURCE_SUBREDDIT"] == source_subreddit]
        elif target_subreddit is not None:
            data = self.data[self.data["TARGET_SUBREDDIT"] == target_subreddit]
        return data.loc[:,["LIWC_Social", "LIWC_Affect", "LIWC_CogMech", "LIWC_Percept", "LIWC_Bio", "LIWC_Relativ"]].mean()

    def get_properties_radar_average(self):
        data = self.data.loc[:,["LIWC_Social", "LIWC_Affect", "LIWC_CogMech", "LIWC_Percept", "LIWC_Bio", "LIWC_Relativ"]].mean()
        return data

    def get_correlation_data(self, source_subreddit: Optional[str] = None, target_subreddit: Optional[str] = None, property1='FRACTION_OF_ALPHABETICAL_CHARS', property2='AUTOMATED_READIBILITY_INDEX'):
        data = self.data
        if source_subreddit is not None and target_subreddit is not None:
            data = self.data[(self.data['SOURCE_SUBREDDIT'] == source_subreddit) & (self.data['TARGET_SUBREDDIT'] == target_subreddit)]
        elif source_subreddit is not None:
            data = self.data[self.data["SOURCE_SUBREDDIT"] == source_subreddit]
        elif target_subreddit is not None:
            data = self.data[self.data["TARGET_SUBREDDIT"] == target_subreddit]
        return data[[property1, property2]]
