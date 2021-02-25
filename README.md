# redditvis

A Visual Analytics dashboard for gaining insights into the [Social Network: Reddit Hyperlink Network](https://snap.stanford.edu/data/soc-RedditHyperlinks.html) data set.

## Running the app

This project uses [Poetry](https://python-poetry.org/) as both a package and environment manager, essentially replacing pip/conda/pipenv and venv/conda.

### Prerequisites

- Python version `3.8.*`

### Docker

This project can be run in a Docker container, by building the `Dockerfile` into an image and running the image as a container.

1. Insert data in the dir `src/data/`. Make sure it is a `parquet.gzip` file.

1. Copy `.env.dist` and name the copy `.env`. Check if the values are correct.

1. Build the image.

    ```bash
    # Build an image called 'infovis-reddit' from the Dockerfile in the current directory '.'
    docker build -t infovis-reddit . 
    ```
1. Create and start a container from the image.

    ```bash
    # Creates and starts a container named infovis-reddit.
    sh start_container.sh
    ```

> **Not recommended for development** as this will make the container crash when the webserver crashes, see below.

#### Developing with containers

For development it is however recommended to not directly start the webserver when you start the container, as an error in your code will crash the running webserver and since it is the main process of the container, it will also crash the entire container. 

Rather, we will start the container without the webserver and then manually start the webserver from inside the container.

Instead of step 4 above, we do the following:

1. Start the container without the webserver
   
    ```bash
    sh start_dev_container.sh
    ```

1. Run the `bash` command in the running container in order to start a terminal session.

    ```bash
    docker exec -it infovis-reddit bash
    ```

1. You are now inside the container. Start the Flask server manually (using the Poetry env).

    ```bash
    poetry run python main.py
    ```

### Without Docker

1. Check that you meet the [prerequisites](#prerequisites) outlined in the beginning of the readme.
1. Insert data in the dir `src/data/`. Make sure it is a `parquet.gzip` file.
1. Copy `.env.dist` and name the copy `.env`. Check if the values are correct.
1. [Install Poetry](https://python-poetry.org/docs/#installation)
1. Create a Poetry environment and install the packages into this environment

    ```bash
    poetry install
    ```

1. Run the Flask development server

    ```bash
    poetry run python main.py
    ```

## Installing packages with Poetry

### Docker

```bash
# Start terminal session in the running container
docker exec -it infovis-reddit bash

poetry add <package-name>
```

### Non-Docker

```bash
poetry add <package-name>
```
