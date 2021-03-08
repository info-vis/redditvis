Vue.component('plot-source-target', {
<<<<<<< HEAD
=======
    data: function () {
        return {
            isLoading: false
        }
    },
>>>>>>> origin/master
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
<<<<<<< HEAD
        // async handleFilter(event) {
        //     this.filterCounter(event.target.value)
        // },
        // updatesubreddit(){
        //     this.sourceSubreddit = this.filterCounter
        //     this.fetchAPIData()
        // },
        async fetchPlot() {
=======
        async fetchPlot() {
            this.isLoading = true
>>>>>>> origin/master
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
<<<<<<< HEAD
            console.log(url)
=======
>>>>>>> origin/master
            const freqResponse = await fetch(url);
            const freqObject = await freqResponse.json();
            
            document.getElementById("plot-source-target").innerHTML = "";
            window.Bokeh.embed.embed_item(freqObject, 'plot-source-target')
<<<<<<< HEAD
=======
            this.isLoading = false
>>>>>>> origin/master
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
<<<<<<< HEAD
        <div id="plot-source-target" class="bk-root"></div>
=======
        <div v-if="isLoading" class="d-flex justify-content-center">
            <div class="spinner-grow my-5" role="status">
            </div>
        </div>
        <div v-show="!isLoading">
            <p class="mb-0 mt-1" >
            <small> <strong> Top target subreddits </strong></small>
            </p>
        </div>
        <div v-show="!isLoading" id="plot-source-target" class="bk-root"></div>
>>>>>>> origin/master
    </div> `
    
})
