import random
import os

import pandas as pd


class BodyModel:
    """Singleton object that can obtain data from the Reddit Body data set.
    """
    __instance = None
    data = None
    BODY_DATA_PATH = os.getenv("EMAIL")


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

        self.data = pd.read_parquet("src/api/data/reddit_hyperlinks.body.parquet.gzip", engine="fastparquet")


    def get_random_20(self):
        min = random.randint(0, len(self.data.index) - 20)
        return self.data[min:min + 20]
