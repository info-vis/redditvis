import math
import os
import pandas as pd


class SentimentBoxHelper:

    data = None

    def __init__(self, data) -> None:
        self.data = data

    def run(self):
        result = self.sum_sentiments()
        return self.get_minmax_values(result)

    def sum_sentiments(self):
        return (
            self.data.groupby(["DATE", "SOURCE_SUBREDDIT"])['LINK_SENTIMENT'].sum()
            .reset_index()
        )
    
    def get_minmax_values(self,data: pd.DataFrame):
        return (
            data['LINK_SENTIMENT'].min(),
            data['LINK_SENTIMENT'].max()
        )