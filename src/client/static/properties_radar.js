Vue.component('properties-radar', {
    data: function () {
        return {
            isLoading: false
        }
    },
    props: {
        sourceSubreddit: String,
        targetSubreddit: String
    },
    watch: {
        sourceSubreddit: "fetchAPIData",
        targetSubreddit: "fetchAPIData"
    },
    methods: {
        async fetchPlot() {
            this.isLoading = true
            let url = `${apiEndpoint}properties-radar`
            const sourceSubredditQuery = `source-subreddit=${this.sourceSubreddit}`
            const targetSubredditQuery = `target-subreddit=${this.targetSubreddit}`
            if (this.sourceSubreddit && this.targetSubreddit) {
                url = url + "?" + sourceSubredditQuery + "&" + targetSubredditQuery
            } else if (this.sourceSubreddit) {
                url = url + "?" + sourceSubredditQuery
            } else if (this.targetSubreddit) {
                url = url + "?" + targetSubredditQuery
            }
            const propertiesResponse = await fetch(url);
            const propertiesRadar = await propertiesResponse.json();
            const graphDiv = document.getElementById("properties-radar")
            Plotly.react(graphDiv, propertiesRadar.data, propertiesRadar.layout, { displayModeBar: false })
            this.isLoading = false
        },
        async fetchAPIData() {
            this.fetchPlot()
        }
    },

    created: async function () {
        this.fetchAPIData()
    },

    template: `
    <div class="card details-container">
        <div class="card-header">
            <div class="row">
                <div class="col-md-10">
                    <p class="mb-0 mt-1" > 
                        <small> <strong> Psychological processes of posts </strong></small>
                        <info-button
                            title="Psychological processes of posts"
                            text="The average values for the psychological processes (an overarching categorisation of topics) of the posts.
                            The processes are computed using LIWC dictionary dimensions."    
                        >
                        </info-button>
                    </p>
                </div>
                <div class="col-md-2">
                    <div v-if="isLoading" class="d-flex justify-content-center">
                        <div class="spinner-grow spinner-grow-sm" role="status"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div id="properties-radar" class="chart"></div>
        </div>
    </div> `
})
