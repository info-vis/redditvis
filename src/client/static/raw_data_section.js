const apiEndpoint = '/api/';

const vm = new Vue.component("raw-data-section", {
    delimiters: ['[[', ']]'],
    props: ["numberOfSubreddits"],
    data: function() {
        return {
            rawData: '',
        }
    },
    created: async function(){
        const gResponse = await fetch(`${apiEndpoint}demo-data?num=${this.numberOfSubreddits}`);
        const gObject = await gResponse.json();
        this.rawData = gObject.data;
    },
    template: `<div id="raw-data-section" class="row">
    <div class="card">
      <div class="card-body">
        Raw data section:
        <code>[[ rawData ]]</code>
      </div>
    </div>
  </div>`
})