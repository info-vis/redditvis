import os
import pandas as pd


class NodeAttributeTransformer:
    """Transforms the body data into data that the network reads."""

    OUTPUT_FILE_NAME = "src/data/node_attributes.parquet.gzip"
    BODY_DATA_PATH = os.getenv("BODY_DATA_PATH")

    def __init__(self) -> None:
        self.data = pd.read_parquet(self.BODY_DATA_PATH, engine="pyarrow")

    def transform(self):
        print("Transforming data to node attribute data..")
        source_count = self.data.groupby("SOURCE_SUBREDDIT").size().reset_index().rename(columns={0: "count", "SOURCE_SUBREDDIT": "subreddit"})
        target_count = self.data.groupby("TARGET_SUBREDDIT").size().reset_index().rename(columns={0: "count", "TARGET_SUBREDDIT": "subreddit"})

        result = pd.merge(source_count, target_count, on="subreddit", how="outer").set_index("subreddit")
        result = result.sum(axis=1).reset_index().rename(columns={0: "total_posts"})
        result.to_parquet(self.OUTPUT_FILE_NAME, engine="pyarrow")
        print("Transform successfull!")

