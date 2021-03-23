Vue.component('properties-plot', {
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
            let url = `${apiEndpoint}top-properties`
            let sourceSubredditQuery = `source-subreddit=${this.sourceSubreddit}`
            let targetSubredditQuery = `target-subreddit=${this.targetSubreddit}`
            if (this.sourceSubreddit && this.targetSubreddit) {
                url = url + "?" + sourceSubredditQuery + "&" + targetSubredditQuery
            } else if (this.sourceSubreddit) {
                url = url + "?" + sourceSubredditQuery
            } else if (this.targetSubreddit) {
                url = url + "?" + targetSubredditQuery
            }
            const propertiesPlotResponse = await fetch(url);
            const propertiesPlot = await propertiesPlotResponse.json();
            const graphDiv = document.getElementById("properties-plot")
            Plotly.react(graphDiv, propertiesPlot.data, propertiesPlot.layout, {displayModeBar: false})
            this.isLoading = false
        },
        async fetchAPIData() {
            this.fetchPlot()
        }
    },
    created: async function(){
        this.fetchAPIData()
    },
    template: `
    <div>
        <div class="row">
            <div class="col-md-10">
                <p class="mb-0 mt-1" >
                <small> <strong> Top topics of the post </strong></small>
                </p>
            </div>
            <div class="col-md-2">
                <div v-if="isLoading" class="d-flex justify-content-center">
                    <div class="spinner-grow spinner-grow-sm" role="status"></div>
                </div>
            </div>
        </div>
        <div id="properties-plot" class="chart"></div>
    </div> `
})
