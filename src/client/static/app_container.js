Vue.component("app-container", {
  name: 'app-container',
  data: function () {
    return {
      networkData: null,
      numberOfLinks: 200,
      numberOfLinksSliderValue: 200,
      isLoadingData: false,
      selectedSourceSubreddit: null,
      selectedTargetSubreddit: null,
      showSubredditNames: false,
      filterValue: null,
      showAlert: false
    }
  },
  computed: {
    detailsOnDemandCardTitle: function () {
      if (this.selectedSourceSubreddit && this.selectedTargetSubreddit) {
        return `Details for the subreddit: ${this.selectedSourceSubreddit} and its target subreddit: ${this.selectedTargetSubreddit}`}
      else if (this.selectedSourceSubreddit) {
        return `Details for the subreddit: ${this.selectedSourceSubreddit}`}
      else if (this.selectedTargetSubreddit) {
        return `Details for the target subreddit: ${this.selectedTargetSubreddit}`}
      return "Details for all subreddits"}
  },
  watch: {
    selectedSourceSubreddit: "fetchData",
    selectedTargetSubreddit: "fetchData",
    numberOfLinks: "fetchData"

  },
  methods: {
    fetchData: async function () {
      this.isLoadingData = true
      let url = ''
      if (this.selectedSourceSubreddit || (this.selectedSourceSubreddit && this.selectedTargetSubreddit)) {
        url = `${apiEndpoint}network?subreddit=${this.selectedSourceSubreddit}`
      } else if (this.selectedTargetSubreddit) {
        url = `${apiEndpoint}network?subreddit=${this.selectedTargetSubreddit}`
      } else {
        url = `${apiEndpoint}network?n_links=${this.numberOfLinks}`
      }
      const response = await fetch(url);
      if (response.status != 200) {
        this.selectedSourceSubreddit = null
        this.selectedTargetSubreddit = null
        this.showAlert = true
        return
      }
      if (this.selectedSourceSubreddit) {
        this.showAlert = false
      }
      const data = await response.json();
      this.networkData = await data
      this.isLoadingData = false
    },
    toggleShowSubredditNames: function () {
      this.showSubredditNames = !this.showSubredditNames
    },
    handleSelectSubreddit: function (payload) {
      if (payload.type == "source") {
        this.selectedSourceSubreddit = payload.selectedSubredditInput
      }
      if (payload.type == "target") {
        this.selectedTargetSubreddit = payload.selectedSubredditInput
      }
    },
    handlePanToSubreddit: function (payload) {
      if (payload == "source") {
        this.$refs.graphNetwork.panToNode(this.selectedSourceSubreddit)
      }
      if (payload == "target") {
        this.$refs.graphNetwork.panToNode(this.selectedTargetSubreddit)
      }
    },
    handleClearSubreddit: function (payload) {
      if (payload == "source") {
        this.selectedSourceSubreddit = null
      }
      if (payload == "target") {
        this.selectedTargetSubreddit = null
      }
    },
    changeNumberOfLinks: function () {
      this.numberOfLinks = this.numberOfLinksSliderValue
    },
    subredditSelectOptions(type) {
      if (this.networkData && this.networkData.nodes) {
        if (this.selectedSourceSubreddit && type == 'target') {
          const targetsOfSelectedSourceSubreddit = this.networkData.links.filter((link) => {
            const source = link[0]
            if (source == this.selectedSourceSubreddit) {
              return link
            }
          }).map(link => link[1])
          return targetsOfSelectedSourceSubreddit
        }
        if (this.selectedTargetSubreddit && type == 'source') {
          const sourcesOfSelectedTargetSubreddit = this.networkData.links.filter((link) => {
            const target = link[1]
            if (target == this.selectedTargetSubreddit) {
              return link
            }
          }).map(link => link[0])
          return sourcesOfSelectedTargetSubreddit
        }
        return this.networkData && this.networkData.nodes.map(x => x[0])
      }
    }
  },
  created: async function () {
    await this.fetchData()
  },
  template: `
    <div id="wrapper">

      <div class="row my-3">
        <!-- Graph network -->
        <div class="col-md-10 pe-0 mb-2">
          <graph-network
            v-if="networkData"
            v-bind:network-data="networkData"
            v-bind:selected-subreddit="selectedSourceSubreddit"
            v-bind:selected-source-subreddit="selectedSourceSubreddit"
            v-bind:selected-target-subreddit="selectedTargetSubreddit"
            v-bind:show-subreddit-names="showSubredditNames"
            ref="graphNetwork"
          ></graph-network>
        </div>

        <!-- Side bar -->
        <div class="col-md-2">

          <!-- Spinner/Loading icon -->
          <div v-if="isLoadingData" class="d-flex justify-content-center col">
              <div class="spinner-grow my-2" role="status">
              </div>
          </div>

          <div class="row" v-if="showAlert"> 
            <div class="col">
              <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Oops!</strong> Could not find the subreddit you entered.
                <button type="button" class="btn-close" @click="showAlert = false" aria-label="Close"></button>
              </div>
            </div>
          </div>

          <div class="row"> 
            <div class="col">
              <div class="mb-1">
                <select-subreddit
                  type="source"
                  borderColor="#03a9f4"
                  :selectedSubreddit="selectedSourceSubreddit"
                  :subredditOptions="subredditSelectOptions('source')"
                  v-on:select-subreddit="handleSelectSubreddit"
                  v-on:pan-to-subreddit="handlePanToSubreddit"
                  v-on:clear-subreddit="handleClearSubreddit"
                ></select-subreddit>
              </div>
            </div>
          </div>
          <div class="row">
           <div class="col">
              <div class="my-1">
                <select-subreddit
                  type="target"
                  borderColor="#ff9800"
                  :selectedSubreddit="selectedTargetSubreddit"
                  :subredditOptions="subredditSelectOptions('target')"
                  v-on:select-subreddit="handleSelectSubreddit"
                  v-on:pan-to-subreddit="handlePanToSubreddit"
                  v-on:clear-subreddit="handleClearSubreddit"
                ></select-subreddit>
              </div>
            </div>
          </div>

          <!-- Graph Controls -->

          <div class="row">

            <div class="col">
            <div class="p-2 rounded my-1 border shadow-sm" style="background-color: white">

              <div class="row">
                <div class="input-group">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="showSubredditNames" v-on:click="toggleShowSubredditNames">
                    <label class="form-check-label" for="showSubredditNames">Show subreddit names</label>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col">
                  <label for="linkSlider" class="form-label">Number of links: {{ numberOfLinksSliderValue }}/137821</label>
                  <input type="range" class="form-range" min="0" max="25000" step="50" id="linkSlider" v-model.number="numberOfLinksSliderValue" @click="changeNumberOfLinks">
                </div>
              </div>

              </div>
            </div>
          </div>

          <div class="row">
            <div class="col">
            <div class="border p-2 rounded my-1 border shadow-sm" style="background-color: white">
                <span class="badge bg-secondary mb-1">Nodes: {{ networkData && networkData.nodes && networkData.nodes.length }}</span>
                <span class="badge bg-secondary">Links: {{ networkData && networkData.links && networkData.links.length }}</span>
            </div>
            </div>
          </div>
          <!-- End Graph Controls -->

        </div>
        <!-- End side bar -->
      </div>

      <!-- Plots section -->
      <div class="row">
        <div class="col">
          <div class="card">
            <div class="card-header">
              <strong> {{detailsOnDemandCardTitle}} </strong>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col">
                  <aggregates-component :source-subreddit="selectedSourceSubreddit" :target-subreddit="selectedTargetSubreddit">
                  </aggregates-component>
                </div>
              </div>
              <div class="row">
                <div class="col-md-3">
                  <info-button1></info-button1>
                  <plot-source-target :source-subreddit="selectedSourceSubreddit" :target-subreddit="selectedTargetSubreddit"></plot-source-target>
                </div>
                <div class="col-md-3">
                  <info-button2></info-button2>
                  <properties-plot :source-subreddit="selectedSourceSubreddit":target-subreddit="selectedTargetSubreddit">
                  </properties-plot>
                </div>
                <div class="col-md-3">
                  <info-button3></info-button3>
                  <properties-radar :source-subreddit="selectedSourceSubreddit" :target-subreddit="selectedTargetSubreddit"></properties-radar>
                </div>
                <div class="col-md-3">
                  <info-button4></info-button4>
                  <correlation-plot :source-subreddit="selectedSourceSubreddit" :target-subreddit="selectedTargetSubreddit"></correlation-plot>
                </div>
                <div class="col">
                  <info-button5></info-button5>
                  <sentiment-box :source-subreddit="selectedSourceSubreddit" v-if="selectedSourceSubreddit"></sentiment-box>
                </div>
              </div>
            </div>
          </div>
       </div>
      </div>
    </div>
  `
})
