Vue.component('sentiment-box', {
    data: function() {
        return {
            data: null,
            width: 700,
            height: 700,
            cellSize: 15,
            years: ['2014','2015','2016','2017'],
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
            const tParser = d3.timeParse("%Y-%m-%d")
            var dateRange = d3.timeDays(new Date(2014, 1, 1), new Date(2017, 12, 31));
            
            console.log(dateRange)
           
            

            let arr = this.data.values
            const maxValue = Math.max(arr);
            const minValue = Math.min(arr);

            years = function(d){
                (d => d3.timeDay(new Date(d).getUTCFullYear()))
            }

            var svg = d3.select("#sentiment-box")
                      .append("svg")
                      .attr("width", this.width)
                      .attr("height", this.height);
    
    
            const group = svg.append("g");

            const year = group
            .selectAll("g")
            .data(this.years)
            .join("g")
            .attr(
                "transform",
                (d, i) => `translate(50, ${this.yearHeight * i + this.cellSize * 1.5})`
            );
            
            year
            .append("text")
            .attr("x", -5)
            .attr("y", -30)
            .attr("text-anchor", "end")
            .attr("font-size", 16)
            .attr("font-weight", 550)
            .attr("transform", "rotate(270)")
            .text(d => d);
  
          const formatDay = d =>
            ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"][d.getUTCDay()];
          const countDay = d => d.getUTCDay();
          const timeWeek = d3.utcSunday;
          const formatDate = d3.utcFormat("%x");
          const colorFn = d3
            .scaleSequential(d3.interpolateBuGn)
            .domain([Math.floor(minValue), Math.ceil(maxValue)]);
          const format = d3.format("+.2%");
  

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
            

        

          year
            .append("g")
            .selectAll("rect")
            .data(dateRange)
            .join("rect")
            .attr("width", this.cellSize - 1.5)
            .attr("height", this.cellSize - 1.5)
            .attr(
              "x",
              (d, i) => timeWeek.count(d3.utcYear(d), d) * this.cellSize + 10)
            .attr("y", (d,i) => countDay(d) * this.cellSize + 0.5)
            .attr("fill", 'Grey')
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
