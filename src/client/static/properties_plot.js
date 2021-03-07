Vue.component('properties-plot', {
    data: function () {
        return {
            isLoading: false,
            plotTitle: ""
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
            this.plotTitle = "Top properties of all subreddits"
            if (this.sourceSubreddit && this.targetSubreddit) {
                url = url + "?" + sourceSubredditQuery + "&" + targetSubredditQuery 
                this.plotTitle = `Top properties of the subreddit: ${this.sourceSubreddit} with the target subreddit: ${this.targetSubreddit}`
            } else if (this.sourceSubreddit) {
                url = url + "?" + sourceSubredditQuery
                this.plotTitle = `Top properties of the subreddit: ${this.sourceSubreddit}`
            } else if (this.targetSubreddit) {
                url = url + "?" + targetSubredditQuery
                his.plotTitle = `Top properties of the subreddit as a target: ${this.targetSubreddit}`
            }
            const propertiesResponse = await fetch(url);
            const propertiesPlot = await propertiesResponse.json();
            document.getElementById("properties-plot").innerHTML = "";
            Bokeh.embed.embed_item(propertiesPlot, 'properties-plot')
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
        <div v-if="isLoading" class="d-flex justify-content-center">
            <div class="spinner-grow my-5" role="status">
            </div>
        </div>
        <div v-show="!isLoading">
            <p class="mb-0 mt-1" >
            <small> <strong> {{plotTitle}} </strong></small>
            </p>
        </div>
        <div v-show="!isLoading" id="properties-plot" class="bk-root"></div>
    </div> `
})

/**
 * 1. Display some arbitrary title that is not dynamic but just in the right position (only when the plot is loaded)
 * 2. Display the title based on what is in plotTitle
 * 3. Change the value of plotTitle based on the fetch
 */
