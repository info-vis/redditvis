Vue.component('sentiment-box', {
    data: function() {
        return {
            targetSubreddit: null
        }
    },
    watch: {
        targetSubreddit: "fetchAPIData"
    },
    methods: {
        // async handleFilter(event) {
        //     this.filterCounter(event.target.value)
        // },
        // updatesubreddit(){
        //      this.targetSubreddit = this.filterCounter
        //      this.fetchAPIData()
        //  },
        async fetchPlot() {
            let url = `${apiEndpoint}sentiment-box`
            // If it is not null, add the query param
            if (this.targetSubreddit) {
                const targetSubredditQuery = `target=${this.targetSubreddit}`
            }
            
            let url = url + "?" + targetSubredditQuery

            console.log(url)
            const sentimentResponse = await fetch(url);
            const sentimentObject = await sentimentResponse.json();

            document.getElementById("sentiment-box").innerHTML = "";
            window.Bokeh.embed.embed_item(sentimentObject, 'sentiment-box')
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
        <div id="sentiment-box" class="bk-root"></div>
    </div> `

}) 