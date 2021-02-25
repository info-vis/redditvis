Vue.component('properties_plot', {
  data: function() {
      return{
          subreddit: "ps4",
      }
    },
    methods: {
        async handleFilter(event) {
            this.getData(event.target.value)
        },
        async getData(subreddit) {
            const propertiesResponse = await fetch(`${apiEndpoint}top-properties?subreddit=${subreddit}`);
            const propertiesObject = await propertiesResponse.json();
            
            document.getElementById("propertiesPlot").innerHTML = "";
            window.Bokeh.embed.embed_item(propertiestObject, 'propertiesPlot')
        }
    },
    created: async function(){
        this.getData("ps4")
    },
    template: `
    <div>
        <div id="propertiesPlot" class="bk-root"></div>
    </div> `
    
})
