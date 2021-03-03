Vue.component('plot-source-target-frequencies', {
    data: function() {
        return {
            sourceSubreddit: null,
            targetSubreddit: null
        }
    },
    watch: {
        sourceSubreddit: "fetchAPIData",
        targetSubreddit: "fetchAPIData"
    },
    methods: {
        // async handleFilter(event) {
        //     this.filterCounter(event.target.value)
        // },
        // updatesubreddit(){
        //     this.sourceSubreddit = this.filterCounter
        //     this.fetchAPIData()
        // },
        async fetchPlot() {
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
            console.log(url)
            const freqResponse = await fetch(url);
            const freqObject = await freqResponse.json();
            
            document.getElementById("plotSourceTargetFreq").innerHTML = "";
            window.Bokeh.embed.embed_item(freqObject, 'plotSourceTargetFreq')
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
        <div id="plotSourceTargetFreq" class="bk-root"></div>
    </div> `
    
})
