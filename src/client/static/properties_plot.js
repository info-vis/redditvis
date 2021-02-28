Vue.component('properties-plot', {
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
            console.log(url)
            const propertiesResponse = await fetch(url);
            const propertiesObject = await propertiesResponse.json();
            
            document.getElementById("propertiesPlot").innerHTML = "";
            window.Bokeh.embed.embed_item(propertiesObject, 'propertiesPlot')
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
        <div id="propertiesPlot" class="bk-root"></div>
    </div> `
    
})
