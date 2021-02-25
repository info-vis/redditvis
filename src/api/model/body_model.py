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

    def get_network_data(self, head: Optional[int] = None) -> pd.DataFrame:
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
        if head is not None:
            return result.head(head)
        return result
