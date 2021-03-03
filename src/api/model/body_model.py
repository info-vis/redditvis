import os
import random
from typing import Optional

import pandas as pd


class BodyModel:
    """Singleton object that can obtain data from the Reddit Body data set.
    """
    __instance = None
    data = None
    BODY_DATA_PATH = os.getenv("BODY_DATA_PATH")

    @staticmethod 
    def getInstance():
        """ Static access method. """
        if BodyModel.__instance == None:
            BodyModel()
        return BodyModel.__instance

    def __init__(self):
        """ Virtually private constructor. """
        if BodyModel.__instance != None:
            raise Exception("This class is a singleton. To create an object, call BodyModel.getInstance()")
        else:
            BodyModel.__instance = self
        self.data = pd.read_parquet(self.BODY_DATA_PATH, engine="pyarrow")

    def get_random_20(self):
        min = random.randint(0, len(self.data.index) - 20)
        return self.data[min:min + 20]

    def get_top_target_subreddits(self, num):
        return self.data.groupby(["TARGET_SUBREDDIT"]).size().reset_index(name="counts") \
            .sort_values("counts", ascending=False).head(num)

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
        return data.loc[:,"LIWC_Funct":"LIWC_Filler"].mean().sort_values(ascending=False).head(10)

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
