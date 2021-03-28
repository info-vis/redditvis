import math
import os
import pandas as pd


class BodyDataTransformer:
    """Transforms the body data into data that the network reads."""

    OUTPUT_FILE_NAME = os.getenv("NETWORK_BODY_DATA_PATH")
    BODY_DATA_PATH = os.getenv("BODY_DATA_PATH")

    def __init__(self) -> None:
        self.data = pd.read_parquet(self.BODY_DATA_PATH, engine="pyarrow")

    def transform(self):
        print("Transforming data to network data..")
        result = self._groupby()
        result["normalized_count"] = self._normalize_count(result)

        result.to_parquet(self.OUTPUT_FILE_NAME, engine="pyarrow")
        print("Transform successfull!")

    def _groupby(self):
        return (
            self.data.groupby(["SOURCE_SUBREDDIT", "TARGET_SUBREDDIT"])
            .size()
            .reset_index()
            .rename(columns={0: "count"})
            .sort_values("count", ascending=False)
        )

    def _normalize_count(self, data: pd.DataFrame) -> pd.Series:
        result = data.apply(lambda row: self._normalize(row["count"]), axis=1)
        return round(result, 2)

    @staticmethod
    def _normalize(value: float) -> float:
        result = math.log(value)
        result += 0.25
        return result
