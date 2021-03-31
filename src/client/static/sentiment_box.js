Vue.component('sentiment-box', {
    data: function () {
        return {
            data: null,
            width: 600,
            height: 100,
            cellSize: 10,
            months: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
            colors: ['#00ff00', '#ff0900', '#00000045'],
            isLoading: false,
            selectedYear: "2017",
            yearOptions: ["2014", "2015", "2016", "2017"],
            colors: {
                positive: "#4caf50",
                neutral: "#eeeeee",
                negative: "#f44336",
                noData: "#fafafa"
            }
        }
    },
    props: {
        sourceSubreddit: {
            type: String,
            default: null
        },
        targetSubreddit: {
            type: String,
            default: null
        }
    },
    watch: {
        sourceSubreddit: "createPlot",
        targetSubreddit: "createPlot",
        selectedYear: "renderSVG"
    },
    computed: {
        yearHeight() {
            return this.cellSize * 7 + 15
        },
        shouldLoadComponent() {
            return (this.sourceSubreddit || this.targetSubreddit) ? true : false
        }
    },
    methods: {
        async fetchAPIData() {
            this.isLoading = true
            let url = `${apiEndpoint}sentiment-box`
            if (this.sourceSubreddit && this.targetSubreddit) {
                url = `${url}?source-subreddit=${this.sourceSubreddit}&target-subreddit=${this.targetSubreddit}`
            } else if (this.sourceSubreddit) {
                url = `${url}?source-subreddit=${this.sourceSubreddit}`
            } else if (this.targetSubreddit) {
                url = `${url}?target-subreddit=${this.targetSubreddit}`
            }
            const response = await fetch(url);
            if (response.status != 200) { // Handle failed responses
                console.log("Failed sentiment data call")
                this.isLoading = false
                return
            }
            this.data = await response.json();
            this.isLoading = false
        },
        clearSentimentBox() {
            document.getElementById("sentiment-box").innerHTML = "";
        },
        drawDayCells: function (year, timeWeek, countDay, colorFn, formatDate) {
            year
                .append("g")
                .selectAll("rect")
                .data(d => d[1])
                .join("rect")
                .attr("width", this.cellSize - 1.5)
                .attr("height", this.cellSize - 1.5)
                .attr(
                    "x",
                    (d) => timeWeek.count(d3.utcYear(d.date), d.date) * this.cellSize + 10)
                .attr("y", d => countDay(d.date) * this.cellSize + 0.5)
                .attr("fill", (d) => {
                    if (d.value == 0) {
                        return this.colors.noData;
                    } else { 
                        return colorFn(d.value); 
                    }
                })
                .append("title")
                .text(d => `${formatDate(d.date)}: ${d.value.toFixed(6)}`);
        },
        drawDayNames: function (year, countDay, formatDay) {
            year
                .append("g")
                .attr("text-anchor", "end")
                .selectAll("text")
                .data(d3.range(7).map(i => new Date(2014, 0, i)))
                .join("text")
                .attr("x", -5)
                .attr("y", d => (countDay(d) + 0.5) * this.cellSize)
                .attr("dy", "0.31em")
                .attr("font-size", 8)
                .text(formatDay);
        },
        drawYearNames: function (year) {
            year
                .append("text")
                .attr("x", -5)
                .attr("y", -30)
                .attr("text-anchor", "end")
                .attr("font-size", 10)
                .attr("font-weight", 550)
                .attr("transform", "rotate(270)")
                .text(d => d[0]);
        },
        createSvg: function () {
            return d3.select("#sentiment-box")
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height);
        },
        bindData: function (group, years) {
            return group
                .selectAll("g")
                .data(years)
                .join("g")
                .attr(
                    "transform",
                    (d, i) => `translate(50, ${this.yearHeight * i + this.cellSize * 1.5})`
                );
        },
        renderSVG() {
            this.clearSentimentBox()
            var svg = this.createSvg();
            const group = svg.append("g");

            // wrangles data into more useable format
            const dateValues = this.data[this.selectedYear].map(dv => ({
                date: d3.timeDay(new Date(dv.DATE)),
                value: dv.AVG_SENT_DAY
            }));
            console.log(this.data)
            console.log(dateValues)
            // wrangles data into array of arrays format
            const years = d3.group(dateValues, d => d.date.getFullYear());
            
            // binds data to all 'g'
            const boundYears = this.bindData(group, years);
            // writes year names on the left
            this.drawYearNames(boundYears);

            // gets min-maxvalues for color scale
            const values = dateValues.map(c => c.value);
            const maxValue = d3.max(values);
            const minValue = d3.min(values);
            const colorFn = d3.scaleLinear()
                .domain([-1, 0, 1])
                .range([this.colors.negative, this.colors.neutral, this.colors.positive])
                .interpolate(d3.interpolateRgb.gamma(2.2))

            const countDay = d => d.getUTCDay();
            const formatDay = d => ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"][d.getUTCDay()];
            // Writes daynames on the left
            this.drawDayNames(boundYears, countDay, formatDay);

            // draws rectangles based on values  
            const timeWeek = d3.utcSunday;    
            const formatDate = d3.utcFormat("%x");         
            this.drawDayCells(boundYears, timeWeek, countDay, colorFn, formatDate);
        },
        createPlot: async function () {
            if (!this.shouldLoadComponent) {
                return
            }
            await this.fetchAPIData()
            this.renderSVG()
        },
    },
    mounted: async function () {
        if (this.shouldLoadComponent) {
            this.createPlot()
        }
    },
    template: `
        <div v-show="shouldLoadComponent">
            <div>
                <div class="row">
                    <div class="col-md-4">
                        <p class="mb-0 mt-1">
                            <small> <strong> Post sentiment per year </strong></small>
                            <info-button
                                title="Sentiment plot"
                                text="The sum of all sentiments of the posts on one day is computed and displayed according to a color scale, 
                                    depending on the overall positivity or negativity of the posts."
                            >
                            </info-button>
                        </p>
                    </div>

                    <div class="col-md-2">
                        <div v-if="isLoading" class="d-flex justify-content-center">
                            <div class="spinner-grow spinner-grow-sm" role="status"></div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="btn-group btn-group-sm float-end" role="group">
                            <button 
                                v-for="year in yearOptions"
                                type="button" 
                                class="btn btn-outline-primary btn-sm"
                                style="padding: 0.2rem .3rem; font-size: 0.675rem;" 
                                :class="{ active: selectedYear == year}"
                                @click="selectedYear = year"
                            >
                                {{ year }}
                            </button>
                        </div>
                    </div>
                </div>

                <div id="sentiment-box"></div>
            </div>
        </div>
    `
})
