Vue.component('sentiment-box', {
    data: function() {
        return {
            data: null,
            width: 1000,
            height: 700,
            cellSize: 15,
            years: ['2017'],
            months: ['J','F','M','A','M','J','J','A','S','O','N','D'],
            colors: ['#00ff00','#ff0900', '#00000045'],
            isLoading: false
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
        targetSubreddit: "createPlot"
    },
    computed: {
        yearHeight(){
            return this.cellSize * 7 + 15
        }
    },

    methods: {
        async fetchAPIData() {
            document.getElementById("sentiment-box").innerHTML = "";
            if (this.sourceSubreddit) {
                this.isLoading = true
                let url = `${apiEndpoint}sentiment-box`
                let sourceSubredditQuery = ""
                // If it is not null, add the query param
                if (this.sourceSubreddit) {
                    sourceSubredditQuery = `source-subreddit=${this.sourceSubreddit}`
                }

                url = url + "?" + sourceSubredditQuery

                const sentimentResponse = await fetch(url);
                const sentimentObject = await sentimentResponse.json();
                this.data = sentimentObject

                this.isLoading = false
            }
        
        },
        
        createPlot: async function(){
            await this.fetchAPIData()
            if (!this.data) {
                return
            }

            // wrangles data into more useable format
            const dateValues = this.data.map(dv => ({
                date: d3.timeDay(new Date(dv.DATE)),
                value: Number(dv.LINK_SENTIMENT)
              }));
            
            // gets min-maxvalues for color scale
              const values = dateValues.map(c => c.value);
              const maxValue = d3.max(values);
              const minValue = d3.min(values);

              
                
            var svg = d3.select("#sentiment-box")
                      .append("svg")
                      .attr("width", this.width)
                      .attr("height", this.height);
    
            
            // wrangles data into array of arrays format
             const years = d3
                            .group(dateValues, d => d.date.getUTCFullYear());
            

            const group = svg.append("g");

            // binds data to all 'g'
            const year = group
            .selectAll("g")
            .data(years)
            .join("g")
            .attr(
              "transform",
              (d, i) => `translate(50, ${this.yearHeight * i + this.cellSize * 1.5})`
            );

        // writes year names on the left
          year
            .append("text")
            .attr("x", -5)
            .attr("y", -30)
            .attr("text-anchor", "end")
            .attr("font-size", 16)
            .attr("font-weight", 550)
            .attr("transform", "rotate(270)")
            .text(d => d[0]);
  
          const formatDay = d =>
            ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"][d.getUTCDay()];
          const countDay = d => d.getUTCDay();
          const timeWeek = d3.utcSunday;
          const formatDate = d3.utcFormat("%x");
          const colorFn = d3
            .scaleSequential(d3.interpolateRdYlGn)
            .domain([-3, 0, 3]); //should be dynamic base on minValue, maxValue
          const format = d3.format("+.2%");
  
        // Writes daynames on the left
          year
            .append("g")
            .attr("text-anchor", "end")
            .selectAll("text")
            .data(d3.range(7).map(i => new Date(2014, 0, i)))
            .join("text")
            .attr("x", -5)
            .attr("y", d => (countDay(d) + 0.5) * this.cellSize)
            .attr("dy", "0.31em")
            .attr("font-size", 12)
            .text(formatDay);
            
        // draws rectangles based on values               
        year
            .append("g")
            .selectAll("rect")
            .data(d => d[1])
            .join("rect")
            .attr("width", this.cellSize - 1.5)
            .attr("height", this.cellSize - 1.5)
            .attr(
            "x",
            (d, i) => timeWeek.count(d3.utcYear(d.date), d.date) * this.cellSize + 10)
            .attr("y", d => countDay(d.date) * this.cellSize + 0.5)
            .attr("fill", function(d){if (d.value == 0){
                return 'Grey'} else {return colorFn(d.value)} })
            .append("title")
            .text(d => `${formatDate(d.date)}: ${d.value.toFixed(2)}`)
        
        },
        
    },
    

    mounted: async function(){
        this.createPlot()
        
    },
    template: `
    <div>
        <div v-if="isLoading" class="d-flex justify-content-center">
            <div class="spinner-grow my-5" role="status">
            </div>
        </div>
        <div v-show="!isLoading">
            <p class="mb-0 mt-1" >
            <small> <strong> Post sentiment per time </strong></small>
            </p>
        </div>
        <div v-show="!isLoading" id="sentiment-box"></div>
    </div> `
})
