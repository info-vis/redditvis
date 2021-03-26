Vue.component('sentiment-box', {
    data: function() {
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
    mounted: async function(){
        this.fetchAPIData()
    },
    template: `
    <div>
        <div v-if="isLoading" class="d-flex justify-content-center">
            <div class="spinner-grow my-5" role="status">
            </div>
        </div>
        <div v-show="!isLoading">
            <p class="mb-0 mt-1" > <info-button5></info-button5>
            <small> <strong> Post sentiment per time </strong></small>
            </p>
        </div>
        <div v-show="!isLoading" id="sentiment-box" class="bk-root"></div>
    </div> `
})
