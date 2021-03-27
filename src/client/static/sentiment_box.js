Vue.component('sentiment-box', {
    data: function () {
        return {
            isLoading: false
        }
    },
    props: {
        sourceSubreddit: {
            type: String,
            default: null
        },
    },
    watch: {
        sourceSubreddit: "fetchAPIData"
    },
    methods: {
        async fetchPlot() {
            document.getElementById("sentiment-box").innerHTML = "";
            if (this.sourceSubreddit) {
                this.isLoading = true
                let url = `${apiEndpoint}sentiment-box`
                let sourceSubredditQuery = ""
                // If it is not null, add the query param
                if (this.sourceSubreddit) {
                    sourceSubredditQuery = `source-subreddit=${this.sourceSubreddit}`
                }

                url = url + "?" + sourceSubredditQuery

                const sentimentResponse = await fetch(url);
                const sentimentObject = await sentimentResponse.json();

                window.Bokeh.embed.embed_item(sentimentObject, 'sentiment-box')
                this.isLoading = false
            }
        },
        async fetchAPIData() {
            this.fetchPlot()
        }
    },
    mounted: async function () {
        this.fetchAPIData()
    },
    template: `
    <div>
        <div v-if="isLoading" class="d-flex justify-content-center">
            <div class="spinner-grow my-5" role="status">
            </div>
        </div>
        <div v-show="!isLoading">
            <p class="mb-0 mt-1" >
                <small> <strong> Post sentiment per time </strong></small>
                <info-button
                    title="Sentiment plot"
                    text="Each cell represents a day in the years 2014, 2015, 2016 and 2017. 
                        The sum of all sentiments of the posts on one day is computed and colored according to a color scale, 
                        depending on the overall positivity or negativity of the posts."
                >
                </info-button>
            </p>
        </div>
        <div v-show="!isLoading" id="sentiment-box" class="bk-root"></div>
    </div> `
})
