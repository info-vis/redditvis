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

    def get_top_target_subreddits(self, num):
        return self.data.groupby(["TARGET_SUBREDDIT"]).size().reset_index(name="counts") \
            .sort_values("counts", ascending=False).head(num)

    def get_sentiments(self, target_subreddit, source_subreddit):
        
        daterange = pd.date_range('01-01-2014', '12-31-2017').astype(str)

        if target_subreddit is not None and source_subreddit is not None:
            return self.data.loc[(self.data['SOURCE_SUBREDDIT'] == source_subreddit) & (self.data['TARGET_SUBREDDIT'] == target_subreddit)] \
                                .sort_values(by=['DATE','TIMEOFDAY']) \
                                .loc(axis=1)['LINK_SENTIMENT', 'DATE'] \
                                .groupby('DATE')['LINK_SENTIMENT'].sum() \
                                .reindex(daterange, fill_value = 0) \
                                .reset_index() \
                                .rename(columns={'index': 'DATE'}) \
                                .to_dict('records')

        elif source_subreddit != None:
            return self.data.loc[self.data['SOURCE_SUBREDDIT'] == source_subreddit] \
                                .sort_values(by=['DATE','TIMEOFDAY']) \
                                .loc(axis=1)['LINK_SENTIMENT', 'DATE'] \
                                .groupby('DATE')['LINK_SENTIMENT'].sum() \
                                .reindex(daterange, fill_value = 0) \
                                .reset_index() \
                                .rename(columns={'index': 'DATE'}) \
                                .to_dict('records')
                                
            
        elif target_subreddit != None:
            return self.data.loc[self.data['TARGET_SUBREDDIT'] == target_subreddit] \
                                .sort_values(by=['DATE','TIMEOFDAY']) \
                                .loc(axis=1)['LINK_SENTIMENT', 'DATE'] \
                                .groupby('DATE')['LINK_SENTIMENT'].sum() \
                                .reindex(daterange, fill_value = 0) \
                                .reset_index() \
                                .rename(columns={'index': 'DATE'}) \
                                .to_dict('records')
        else:
            print('Something went wrong in get_sentiments function')
        return
    def get_average_sentiments(self, target_subreddit, source_subreddit):
        if target_subreddit != None and source_subreddit != None:
            return float(self.data.loc[(self.data['SOURCE_SUBREDDIT'] == source_subreddit) & (self.data['TARGET_SUBREDDIT'] == target_subreddit)] \
                                .loc['LINK_SENTIMENT']
                                .mean())
        elif source_subreddit != None:
            return float(self.data.loc[self.data['SOURCE_SUBREDDIT'] == source_subreddit] \
                                .loc['LINK_SENTIMENT']
                                .mean())
        elif target_subreddit != None:
            return float(self.data.loc[self.data['TARGET_SUBREDDIT'] == target_subreddit] \
                                .loc['LINK_SENTIMENT']
                                .mean())
        else:
            print('Something went wrong in get_average_sentiments function')

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
        data = self.data
        if source_subreddit is not None and target_subreddit is not None:
            data = self.data[(self.data['SOURCE_SUBREDDIT'] == source_subreddit) & (self.data['TARGET_SUBREDDIT'] == target_subreddit)]
        elif source_subreddit is not None:
            data = self.data[self.data["SOURCE_SUBREDDIT"] == source_subreddit]
        elif target_subreddit is not None:
            data = self.data[self.data["TARGET_SUBREDDIT"] == target_subreddit]
        return data.loc[:, ['Fraction of alphabetical characters',
       'Fraction of digits', 'Fraction of uppercase characters',
       'Fraction of white spaces', 'Fraction of special characters', 'Fraction of stopwords',]].mean().sort_values(ascending=False).multiply(100).round(decimals=2)
