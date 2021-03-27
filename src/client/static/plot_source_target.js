
Vue.component('plot-source-target', {
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
            let url = `${apiEndpoint}source-target-frequencies`
            let sourceSubredditQuery = `source-subreddit=${this.sourceSubreddit}`
            let targetSubredditQuery = `target-subreddit=${this.targetSubreddit}`
            if (this.sourceSubreddit && this.targetSubreddit) {
                url = url + "?" + sourceSubredditQuery + "&" + targetSubredditQuery
            } else if (this.sourceSubreddit) {
                url = url + "?" + sourceSubredditQuery
            } else if (this.targetSubreddit) {
                url = url + "?" + targetSubredditQuery
            }
            const freqResponse = await fetch(url);
            const freqObject = await freqResponse.json();

            Plotly.react(document.getElementById("plot-source-target"), freqObject.data, freqObject.layout, { displayModeBar: false })
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
  <div>
    <div class="row">
        <div class="col-md-10">
            <p class="mb-0 mt-1" v-if="this.sourceSubreddit && this.targetSubreddit">
                <small> <strong> Number of posts </strong></small>
                <info-button 
                    title="Number of posts" 
                    text="If both source and target subreddits are selected,
                        the top 10 number of posts of the source subreddit linking to the target subreddit is displayed."
                >
                </info-button>
            </p>
            <p class="mb-0 mt-1" v-else-if=this.targetSubreddit>
                <small> <strong> Top source subreddits </strong></small> 
                <info-button
                    title="Top incoming subreddits"
                    text="If a target subreddit is selected, the top 10 incoming subreddits of this target subreddit are displayed."
                >
                </info-button>
            </p>
            <p class="mb-0 mt-1" v-else>
                <small> <strong> Top target subreddits </strong></small>
                <info-button
                    title="Top target subreddits"
                    text="If no subreddits are selected, the 10 most frequently hyperlinked subreddits in general are displayed.
                        If a source subreddit is selected, the 10 most targeted subreddits of this source subreddit are displayed."
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
    <div id="plot-source-target" class="bk-root"></div>
  </div> `


})
