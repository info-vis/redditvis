// Define a new component called graph-network
Vue.component('filters', {
    data: function() {
      return {
        data: {},
        numberOfLinks: 200
      }
    },
    methods: {
      /**
       * Fetch data and set this.data.
       */
       fetchData: async function() {
          const response = await fetch(`${apiEndpoint}network?n_links=${this.numberOfLinks}`);
          const data = await response.json();
          this.data = await data
      },
    },
    created: async function() {
      await this.fetchData()
    },
    updated: function () {
      console.log('updated')
      console.log(this.data)
    },
    template: `<div id="filters">
    <label for="exampleDataList" class="form-label">Subreddit Filter</label>
    <input class="form-control" list="datalistOptions" id="exampleDataList" placeholder="Type to search...">
      <datalist id="datalistOptions">
        <option v-for="subreddit in data.nodes">{{ subreddit }}</li></option>
        <graph-network v-if="data" v-bind:data="data"></graph-network>
      </datalist>
    </div>`
  })
