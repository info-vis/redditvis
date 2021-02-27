Vue.component('properties-plot', {
  data: function() {
      return{
          subreddit: "ps4"
      }
    },
    watch: {
        subreddit: "fetchAPIData"
    },
    methods: {
        async handleFilter(event) {
            this.filterCounter(event.target.value)
        },
        updatesubreddit(){
            this.subreddit = this.filterCounter
            this.fetchAPIData()
        },
        async fetchPlot() {
            const propertiesResponse = await fetch(`${apiEndpoint}top-properties?subreddit=${this.subreddit}`);
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
