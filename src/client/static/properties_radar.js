Vue.component('properties-radar', {
    data: function () {
        return {
            isLoading: false
        }
    },
    props:{
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
            let url = `${apiEndpoint}properties-radar`
            const sourceSubredditQuery = `source-subreddit=${this.sourceSubreddit}`
            const targetSubredditQuery = `target-subreddit=${this.targetSubreddit}`
            if (this.sourceSubreddit && this.targetSubreddit) {
                url = url + "?" + sourceSubredditQuery + "&" + targetSubredditQuery 
            } else if (this.sourceSubreddit) {
                url = url + "?" + sourceSubredditQuery
            } else if (this.targetSubreddit) {
                url = url + "?" + targetSubredditQuery
            }
            const propertiesResponse = await fetch(url);
            const propertiesRadar = await propertiesResponse.json();
            const graphDiv = document.getElementById("properties-radar")
            Plotly.react(graphDiv, propertiesRadar.data, propertiesRadar.layout, {displayModeBar: false})
            this.isLoading = false
        },
        async fetchAPIData () {
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
            <small> <strong> Psychological properties of posts </strong></small>
            </p>
        </div>
        <div v-show="!isLoading" id="properties-radar" class="chart"></div>
    </div> `
})
