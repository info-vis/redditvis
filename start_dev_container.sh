#! /usr/bin/env bash

docker run -dit \
    --mount type=bind,source="$(pwd)",target=/app \
    -p 5000:5000 \
    --name=infovis-reddit \
    infovis-reddit:latest \
    bash