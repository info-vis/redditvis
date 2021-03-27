Vue.component('correlation-plot', {
    data: function () {
        return {
            isLoading: false,
            xAxisProperty: 'Fraction of alphabetical characters',
            yAxisProperty: 'Automated readability index',
            selectedX: null,
            selectedY: null,
            properties: ['Fraction of alphabetical characters', 'Fraction of digits', 'Fraction of uppercase characters',
                'Fraction of white spaces', 'Fraction of special characters',
                'Average word length', 'Fraction of stopwords', 'Average number of characters per sentence',
                'Average number of words per sentence', 'Automated readability index',
                'Swear words', 'Social processes', 'Family', 'Friends', 'Humans',
                'Affective processes', 'Positive emotions', 'Negative emotions',
                'Anxiety', 'Anger', 'Sadness', 'Cognitive processes', 'Insight',
                'Causation', 'Discrepancy', 'Tentative', 'Certainty', 'Inhibition',
                'Inclusive', 'Exclusive', 'Perceptual processes', 'Seeing', 'Hearing',
                'Feeling', 'Biological processes', 'Body', 'Health', 'Sexuality',
                'Ingestion', 'Relativity', 'Motion', 'Space', 'Time', 'Work',
                'Achievement', 'Leisure', 'Home', 'Money', 'Religion', 'Death'],
            selectStyle: { "font-size": "10px" }
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
            Plotly.react(graphDiv, correlationPlot.data, correlationPlot.layout, { displayModeBar: false })
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
    created: async function () {
        this.fetchPlot()
    },
    template: `
    <div>
        <div class="row"> 
            <div class="col-md-10">
                <p class="mb-0 mt-1" > 
                    <small> <strong> Correlation of post properties </strong></small>
                    <info-button
                        title="Correlation of post properties"
                        text="This plot enables interactive visualization of the correlation between two selected properties. 
                            The user can explore the relationships between properties to see if they affect each other and draw their own insights. 
                            There are 50 properties to select from, including descriptive details and topics of the posts."
                    ></info-button>
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
