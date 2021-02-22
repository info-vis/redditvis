const apiEndpoint = '/api/';

const vm = new Vue({
    el: '#vm',
    delimiters: ['[[', ']]'],
    data: {
        rawData: '',
        numberOfSubreddits: "20",
    },
    methods: {
        async fetchAPIData(event) {
            const plotResponse = await fetch(`${apiEndpoint}plot1?num=${event.target.value}`);
            const plotObject = await plotResponse.json();

            const rawDataResponse = await fetch(`${apiEndpoint}demo-data?num=${event.target.value}`);
            const rawDataObject = await rawDataResponse.json();
            
            this.rawData = rawDataObject.data;

            document.getElementById("testPlot").innerHTML = "";
            window.Bokeh.embed.embed_item(plotObject, 'testPlot')
        }
    },
    created: async function(){
        const gResponse = await fetch(`${apiEndpoint}demo-data?num=${this.numberOfSubreddits}`);
        const gObject = await gResponse.json();
        this.rawData = gObject.data;

        const plot1 = await fetch(`${apiEndpoint}plot1?num=${this.numberOfSubreddits}`);
        const gObject2 = await plot1.json();
        window.Bokeh.embed.embed_item(gObject2, 'testPlot')

    }
})