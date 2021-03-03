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
                    <input type="range" class="form-range" min="0" max="137821" step="1000" id="linkSlider" v-model.number="numberOfLinksSliderValue" @click="changeNumberOfLinks">
                  </div>
                  <div class="col">
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="showSubredditNames" v-on:click="toggleShowSubredditNames">
                        <label class="form-check-label" for="showSubredditNames">Show subreddit names</label>
                      </div>
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

        <!-- Selection -->
        <div class="col-md-3">
          <div class="row pb-2">
            <div class="col">
              <div id="tooltip">
                <strong>Selected subreddit:</strong> 
                <div>
                  <a v-if="selectedSubreddit"
                    class="" 
                    target="_blank" 
                    v-bind:href="subredditLink"
                    role="button"
                    v-bind:title="subredditLink"
                  >
                    r/{{ selectedSubreddit }}
                  </a>
                </div>
                <div v-if="!selectedSubreddit">None</div>
              </div>
            </div>
          </div>
          <div class="row float-end">
            <div class="col px-0">
              <button class="btn btn-primary btn-sm" v-bind:disabled="!selectedSubreddit" @click="panToSelectedSubreddit">
                <i class="bi bi-geo-fill"></i>              
              </button>
            </div>
            <div class="col">
              <button class="btn btn-danger btn-sm" v-bind:disabled="!selectedSubreddit" @click="clearFilters">
                <i class="bi bi-x-circle"></i>
              </button>
            </div>
          </div>
          <form v-on:submit.prevent="submitFilter">
            <div class="mb-2">
                <label for="exampleDataList" class="form-label">Select a subreddit</label>
                <input v-on:keyup.enter="submitFilter" v-model="filterValue" class="form-control" list="datalistOptions" id="exampleDataList" placeholder="Type a subreddit name..">
                <datalist v-if="networkData" id="datalistOptions">
                    <option v-for="subreddit in networkData.nodes">{{ subreddit }}</li></option>
                </datalist>
            </div>
            <button type="submit" class="btn btn-primary">Select subreddit</button>
          </form>
        </div>

      </div>

      <div class="row">
        <properties-plot :source-subreddit="selectedSubreddit"></properties-plot>
      </div>
    </div>
    `
})
