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
        self.data = pd.read_parquet(self.BODY_DATA_PATH, engine="fastparquet")


    def get_random_20(self):
        min = random.randint(0, len(self.data.index) - 20)
        return self.data[min:min + 20]

    def get_top_target_subreddits(self, num):
        return self.data.groupby(["TARGET_SUBREDDIT"]).size().reset_index(name="counts") \
            .sort_values("counts", ascending=False).head(num)

    def get_top_properties(self, source_subreddit: Optional[str] = None, target_subreddit: Optional[str] = None):
        """Getting top 10 semantic properties of the post for the source subredddit, target subreddit or all subreddits. 

        Args:
            source_subreddit (str, optional): The source subreddit you wish to get top properties for. Defaults to None.
            target_subreddit (str, optional): The target subreddit you wish to get top properties for. Defaults to None.

        Returns:
            [type]: [description]
        """
        data = self.data
        if source_subreddit is not None and target_subreddit is not None:
            data = self.data[(self.data['SOURCE_SUBREDDIT'] == source_subreddit) & (self.data['TARGET_SUBREDDIT'] == target_subreddit)]
        elif source_subreddit is not None:
            data = self.data[self.data["SOURCE_SUBREDDIT"] == source_subreddit]
        elif target_subreddit is not None:
            data = self.data[self.data["TARGET_SUBREDDIT"] == target_subreddit]
        return data.loc[:,"LIWC_Funct":"LIWC_Filler"].mean().sort_values(ascending=False).head(10)

