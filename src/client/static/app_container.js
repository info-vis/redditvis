Vue.component("app-container", {
  name: 'app-container',
  data: function () {
    return {
      networkData: null,
      numberOfLinks: 200,
      numberOfLinksSliderValue: 200,
      isLoadingData: false,
      selectedSubreddit: null,
      showSubredditNames: false,
      filterValue: null
    }
  },
  computed: {
    subredditLink: function () {
      return `https://www.reddit.com/r/${this.selectedSubreddit}/`
    }
  },
  methods: {
    fetchData: async function () {
      this.isLoadingData = true
      const response = await fetch(`${apiEndpoint}network?n_links=${this.numberOfLinks}`);
      const data = await response.json();
      this.networkData = await data
      this.isLoadingData = false
    },
    toggleShowSubredditNames: function () {
      this.showSubredditNames = !this.showSubredditNames
    },
    selectSubreddit: function (subredditName) {
      this.selectSubreddit = subredditName
    },
    panToSelectedSubreddit: function () {
      this.$refs.graphNetwork.panToSelectedSubreddit()
    },
    submitFilter: function (event) {
      const input = event.target.value
      if (this.networkData.nodes.includes(this.filterValue)) {
        this.selectedSubreddit = this.filterValue
      }
    },
    changeNumberOfLinks: function () {
      this.numberOfLinks = this.numberOfLinksSliderValue
      this.fetchData()
    },
    clearFilters: function () {
      this.filterValue = null
      this.selectedSubreddit = null
    }
  },
  created: async function () {
    await this.fetchData()
  },
  template: `
    <div id="wrapper">

      <!-- Spinner/Loading icon -->
      <div v-if="isLoadingData" class="d-flex justify-content-center col">
          <div class="spinner-grow mt-5" role="status">
          </div>
      </div>

      <!-- Top bar -->
      <div v-if="networkData" class="row">
          <div class="col-md-9 mb-2">
              <div class="row my-2">
                  <div class="col">
                      <p class="m-2">
                        <span class="badge bg-secondary mb-1">Nodes: {{ networkData.nodes && networkData.nodes.length }}</span>
                        <span class="badge bg-secondary">Links: {{ networkData.links && networkData.links.length }}</span>
                      </p>
                  </div>
                  <div class="col">
                    <label for="linkSlider" class="form-label">Number of links: {{ numberOfLinksSliderValue }}/137821</label>
                    <input type="range" class="form-range" min="1" max="137821" id="linkSlider" v-model.number="numberOfLinksSliderValue" @click="changeNumberOfLinks">
                  </div>
                  <div class="col">
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="showSubredditNames" v-on:click="toggleShowSubredditNames">
                        <label class="form-check-label" for="showSubredditNames">Show subreddit names</label>
                      </div>
                  </div>
                  <div class="col">
                      <div id="tooltip">
                          Selected subreddit: 
                          <a  v-if="selectedSubreddit"
                            class="btn btn-primary btn-sm" 
                            target="_blank" 
                            v-bind:href="subredditLink"
                            role="button"
                            v-bind:title="subredditLink"
                          >
                            r/{{ selectedSubreddit }}
                          </a>
                      </div>
                  </div>
                  <div class="col">
                      <button class="btn btn-primary btn-sm" v-bind:disabled="!selectedSubreddit" @click="panToSelectedSubreddit">
                          Pan to selection
                      </button>
                  </div>
              </div>
          </div>
      </div>

      <div class="row">

        <!-- Graph network -->
        <div class="col-md-9">
          <graph-network
            v-if="networkData"
            v-bind:network-data="networkData"
            v-bind:selected-subreddit="selectedSubreddit"
            v-bind:show-subreddit-names="showSubredditNames"
            ref="graphNetwork"
          ></graph-network>
        </div>

        <!-- Filters -->
        <div class="col-md-3">
          <div id="filters">
            <div class="row">
              <div class="col">
                <h3>Filters</h3>
              </div>
              <div class="col">
                <button class="btn btn-danger btn-sm float-end" @click="clearFilters">Clear filters</button>
              </div>
            </div>
            <form v-on:submit.prevent="submitFilter">
              <div class="mb-2">
                  <label for="exampleDataList" class="form-label">Subreddit Filter</label>
                  <input v-on:keyup.enter="submitFilter" v-model="filterValue" class="form-control" list="datalistOptions" id="exampleDataList" placeholder="Type a subreddit name..">
                  <datalist v-if="networkData" id="datalistOptions">
                      <option v-for="subreddit in networkData.nodes">{{ subreddit }}</li></option>
                  </datalist>
              </div>
              <button type="submit" class="btn btn-primary">Filter on subreddit</button>
              </form>
          </div>
        </div>

      </div>

      <div class="row">
        <properties-plot :source-subreddit="selectedSubreddit"></properties-plot>
      </div>
    </div>
    `
})
