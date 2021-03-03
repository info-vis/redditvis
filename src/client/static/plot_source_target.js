Vue.component('plot-source-target', {
    data: function () {
        return {
            isLoading: false
        }
    },
    props: {
        sourceSubreddit: {
            default: null,
            type: String
        }
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
            
            document.getElementById("plot-source-target").innerHTML = "";
            window.Bokeh.embed.embed_item(freqObject, 'plot-source-target')
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
        <div v-show="!isLoading" id="plot-source-target" class="bk-root"></div>
    </div> `
    
})
