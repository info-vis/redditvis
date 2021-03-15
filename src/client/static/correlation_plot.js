Vue.component('correlation-plot', {
    data: function () {
        return {
            isLoading: false,
            xAxisProperty: 'FRACTION_OF_ALPHABETICAL_CHARS', 
            yAxisProperty: 'AUTOMATED_READIBILITY_INDEX',
            selectedX: null,
            selectedY: null,
            properties: ['FRACTION_OF_ALPHABETICAL_CHARS', 'FRACTION_OF_DIGITS', 'FRACTION_OF_UP_CHARS', 'FRACTION_OF_WHITESPACE',
            'FRACTION_OF_SPECIAL_CHARS', 'FRACTION_OF_STOPWORDS', 'AUTOMATED_READIBILITY_INDEX', "LIWC_Social", "LIWC_Affect", 
            "LIWC_CogMech", "LIWC_Percept", "LIWC_Bio", "LIWC_Relativ", 'LIWC_Family', 'LIWC_Friends', 'LIWC_Humans', 'LIWC_Posemo', 
            'LIWC_Negemo', 'LIWC_Anx', 'LIWC_Anger', 'LIWC_Sad', 'LIWC_Insight', 'LIWC_Cause', 'LIWC_Discrep', 'LIWC_Tentat', 'LIWC_Certain', 
            'LIWC_Inhib', 'LIWC_Incl', 'LIWC_Excl', 'LIWC_See', 'LIWC_Hear', 'LIWC_Feel', 'LIWC_Body', 'LIWC_Health', 'LIWC_Sexual', 
            'LIWC_Ingest', 'LIWC_Motion', 'LIWC_Space', 'LIWC_Time', 'LIWC_Work', 'LIWC_Achiev', 'LIWC_Leisure', 'LIWC_Home', 'LIWC_Money', 
            'LIWC_Relig', 'LIWC_Death'],
            selectStyle: {"font-size": "10px"}
        }
    },
    props: {
        sourceSubreddit: String,
        targetSubreddit: String
    },
    watch: {
        sourceSubreddit: "fetchPlot",
        targetSubreddit: "fetchPlot",
        xAxisProperty: "fetchPlot",
        yAxisProperty: "fetchPlot"
    },
    methods: {
        async fetchPlot() {
            this.isLoading = true
            const url = this.createApiUrl()
            const correlationPlotResponse = await fetch(url);
            const correlationPlot = await correlationPlotResponse.json();
            const graphDiv = document.getElementById("correlation-plot")
            Plotly.react(graphDiv, correlationPlot.data, correlationPlot.layout, {displayModeBar: false})
            this.isLoading = false
        },
        createApiUrl() {
            let url = `${apiEndpoint}correlation?`
            const queries = {}
            queries["source-subreddit"] = this.sourceSubreddit
            queries["target-subreddit"] = this.targetSubreddit
            queries["x-axis-property"] = this.xAxisProperty
            queries["y-axis-property"] = this.yAxisProperty

            const queriesLen = Object.keys(queries).length
            let index = 0

            for (const [key, value] of Object.entries(queries)) {
                index++
                if (value) {
                    url = url + key + "=" + value + "&"
                    
                }
            }
            url = url.substring(0, url.length - 1);
            return url
        }
    },
    created: async function(){
        this.fetchPlot()
    },
    template: `
    <div>
        <div class="row"> 
            <div class="col-md-10">
                <p class="mb-0 mt-1" >
                <small> <strong> Correlation of post properties </strong></small>
                </p>
            </div>
            <div class="col-md-2">
                <div v-if="isLoading" class="d-flex justify-content-center">
                    <div class="spinner-grow spinner-grow-sm" role="status"></div>
                </div>
            </div>
        </div>
        <div class="row"> 
            <div class="col my-1">
                <label for="xAxis" style="font-size: 10px">X axis property</label>
                <select id="xAxis" class="form-select form-select-sm" aria-label=".form-select-sm example" v-model="xAxisProperty" :style="selectStyle">
                    <option :value="item" v-for="item in properties" > {{ item }} </option>               
                </select>
            </div>
            <div class="col my-1">
                <label for="yAxis" style="font-size: 10px">Y axis property</label>
                <select id="yAxis" class="form-select form-select-sm" aria-label=".form-select-sm example" v-model="yAxisProperty" :style="selectStyle">
                    <option :value="item" v-for="item in properties" > {{ item }} </option>               
                </select>
            </div>
        </div>
        <div id="correlation-plot" class="chart"></div>
    </div> `
})
