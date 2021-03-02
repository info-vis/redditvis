Vue.component("example-plot", {
    data: function () {
        return {
            rawData: '',
            numberOfSubreddits: "20",
            sliderCounter: "20"
        }
    },
    watch: {
        numberOfSubreddits: "fetchAPIData"
    },
    methods: {
        handleSliderChange(event) {
            this.sliderCounter = event.target.value
        },
        updateNumberOfSubreddits() {
            this.numberOfSubreddits = this.sliderCounter
            this.fetchAPIData()
        },
        async fetchPlot() {
            const plotResponse = await fetch(`${apiEndpoint}plot1?num=${this.numberOfSubreddits}`);
            const plotObject = await plotResponse.json();
            document.getElementById("testPlot").innerHTML = "";
            window.Bokeh.embed.embed_item(plotObject, 'testPlot')
        },
        async fetchRawData() {
            const rawDataResponse = await fetch(`${apiEndpoint}demo-data?num=${this.numberOfSubreddits}`);
            const rawDataObject = await rawDataResponse.json();
            this.rawData = rawDataObject.data;
        },
        async fetchAPIData() {
            this.fetchPlot()
            this.fetchRawData()
        }
    },
    created: async function(){
        this.fetchAPIData()
    },
    template: `
    <div>
        <div class="row">
            <!-- Plot -->
            <div class="col-md-8">
            <div id='testPlot' class="bk-root"></div>
            </div>
            <!-- Slider -->
            <div class="col-md-4">
            <label for="customRange1" class="form-label">Number of subreddits</label>
            <input
                type="range"
                class="form-range"
                id="numSubredditsSlider"
                v-model="sliderCounter"
                min="1"
                max="50"
                @mouseup="updateNumberOfSubreddits"
            >
            <p>Number of subreddits selected: {{ sliderCounter }}</p>
            </div>
        </div>
        <!-- Raw data section -->
        <div class="row">
            <div class="card">
            <div class="card-body">
                <code>{{ rawData }}</code>
            </div>
            </div>
        </div>
    </div>
    `
})
