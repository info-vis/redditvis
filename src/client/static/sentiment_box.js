Vue.component('sentiment-box', {
    data: function() {
        return {
            data: null,
            width: 400,
            barHeight: 50,
            colors: ['#00ff00','#ff0900', '#00000045'],
            isLoading: false
        }
    },
    props: {
        sourceSubreddit: {
            type: String,
            default: null
        },
    },
    watch: {
        sourceSubreddit: "createPlot"
    },
    computed: {
        barWidth(){
            return this.width / this.data.length
        },
        strokeWidth(){
            return (this.widht / this.data.lenght) * 0.05
        }
        // this.strokeWidth = this.barWidth*0.05
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
            console.log(this.data.length)
            var graph = d3.select("#sentiment-box")
                      .append("svg")
                      .attr("width", this.width)
                      .attr("height", this.barHeight);
    
            var bar = graph.selectAll("g")
                      .data(this.data)
                      .enter()
                      .append("g")
                      .attr("transform", (d, i) => {
                            return "translate(" + i * this.barWidth + ",0)";
                      });
    
            bar.append("rect")
            .attr("width", this.barWidth)
            .attr("height", this.barHeight)
            .attr("stroke-width",this.strokeWidth)
            .attr("stroke", this.colors[2])
            .attr("fill", (d)=>{
                if (d < 1) {
                    return this.colors[1];
                } else {return this.colors[0];}
            });
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
