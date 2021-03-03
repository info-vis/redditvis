Vue.component('sentiment-box', {
    data: function() {
        return {
            isLoading: false
        }
    },
    props: {
        targetSubreddit: {
            type: String,
            default: null
        },
    },
    watch: {
        targetSubreddit: "fetchAPIData"
    },
    methods: {
        async fetchPlot() {
            document.getElementById("sentiment-box").innerHTML = "";
            if (this.targetSubreddit) {
                this.isLoading = true
                let url = `${apiEndpoint}sentiment-box`
                let targetSubredditQuery = ""
                // If it is not null, add the query param
                if (this.targetSubreddit) {
                    targetSubredditQuery = `target=${this.targetSubreddit}`
                }
                
                url = url + "?" + targetSubredditQuery

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
            <div class="spinner-grow mt-5" role="status">
            </div>
        </div>
        <div id="sentiment-box" class="bk-root"></div>
    </div> `

}) 