Vue.component("app-container", {
  name: 'app-container',
  data: function () {
    return {
      networkData: null, // The raw data used in the graph-network component
      numberOfLinks: 500,
      numberOfLinksSliderValue: 500,
      isLoadingData: false, // Whether network data is currently being loaded
      selectedSourceSubreddit: null, // The selected source subreddit after going through validation
      selectedTargetSubreddit: null, // The selected target subreddit after going through validation
      sourceSubredditQuery: null, // The input form value of the source select component after submission
      targetSubredditQuery: null, // The input form value of the target select component after submission
      shownSubgraph: null, // The name of the subreddit for which the current subgraph is shown for
      showSubredditNames: false, // Whether subreddit names should be shown in the graph-network
      alerts: [], // A list of alerts that are shown on the screen
      showForceControls: false,
      collapseAllClusters: true
    }
  },
  computed: {
    detailsOnDemandCardTitle: function () {
      if (this.selectedSourceSubreddit && this.selectedTargetSubreddit) {
        return `Details for the subreddit: ${this.selectedSourceSubreddit} and its target subreddit: ${this.selectedTargetSubreddit}`
      }
      else if (this.selectedSourceSubreddit) {
        return `Details for the subreddit: ${this.selectedSourceSubreddit}`
      }
      else if (this.selectedTargetSubreddit) {
        return `Details for the target subreddit: ${this.selectedTargetSubreddit}`
      }
      return "Details for all subreddits"
    },
    subredditLink: function () {
      return `https://www.reddit.com/r/${this.shownSubgraph}/`
    },
  },
  watch: {
    selectedSourceSubreddit() {
      if (!this.selectedSourceSubreddit && !this.selectedTargetSubreddit) {
        this.fetchData()
      }
    },
    selectedTargetSubreddit() {
      if (!this.selectedSourceSubreddit && !this.selectedTargetSubreddit) {
        this.fetchData()
      }
    },
    sourceSubredditQuery: function (query) {
      if (query != null) {
        this.handleSubredditQueryChange(type = "source")
      }
    },
    targetSubredditQuery: function (query) {
      if (query != null) {
        this.handleSubredditQueryChange(type = "target")
      }
    },
    numberOfLinks: "fetchData"
  },
  methods: {
    /**
     * @param {String} type Either 'source' or 'target'
     */
    handleSubredditQueryChange: function (type) {
      if (this.selectedSourceSubreddit && type == 'target') {
        const isValid = this.validateLink(this.selectedSourceSubreddit, this.targetSubredditQuery, type)
        if (isValid) {
          this.selectedTargetSubreddit = this.targetSubredditQuery
        }
        this.targetSubredditQuery = null
      } else if (this.selectedTargetSubreddit && type == 'source') {
        const isValid = this.validateLink(this.sourceSubredditQuery, this.selectedTargetSubreddit, type)
        if (isValid) {
          this.selectedSourceSubreddit = this.sourceSubredditQuery
        }
        this.sourceSubredditQuery = null
      } else {
        let counterpartsSubgraphIsShown
        if (type == "source") {
          counterpartsSubgraphIsShown = this.selectedTargetSubreddit && this.selectedTargetSubreddit == this.shownSubgraph
        } else {
          counterpartsSubgraphIsShown = this.selectedSourceSubreddit && this.selectedSourceSubreddit == this.shownSubgraph
        }
        if (!counterpartsSubgraphIsShown) {
          this.fetchData()
        }
      }
    },
    getSubredditToFetchSubgraphFor() {
      if (this.sourceSubredditQuery) return this.sourceSubredditQuery
      if (this.targetSubredditQuery) return this.targetSubredditQuery
      return null
    },
    getNetworkUrl() {
      if (this.sourceSubredditQuery) {
        return `${apiEndpoint}network?subreddit=${this.sourceSubredditQuery}`
      } else if (this.targetSubredditQuery) {
        return `${apiEndpoint}network?subreddit=${this.targetSubredditQuery}`
      } else {
        return `${apiEndpoint}network?n_links=${this.numberOfLinks}`
      }
    },
    clearQueries() {
      this.sourceSubredditQuery = null
      this.targetSubredditQuery = null
    },
    fetchData: async function () {
      this.isLoadingData = true
      const url = this.getNetworkUrl()
      const response = await fetch(url);
      const subredditToFetchSubgraphFor = this.getSubredditToFetchSubgraphFor()

      if (response.status != 200) { // Handle failed responses
        this.clearQueries()
        this.addAlert(`Subreddit <strong>${subredditToFetchSubgraphFor}</strong> was not found.`)
        this.isLoadingData = false
        return
      }

      const data = await response.json();
      this.networkData = await data
      this.shownSubgraph = subredditToFetchSubgraphFor

      if (this.sourceSubredditQuery) {
        this.selectedSourceSubreddit = this.sourceSubredditQuery
      }
      if (this.targetSubredditQuery) {
        this.selectedTargetSubreddit = this.targetSubredditQuery
      }

      this.clearQueries()
      this.removeAllAlerts()
      this.isLoadingData = false
    },
    toggleShowSubredditNames: function () {
      this.showSubredditNames = !this.showSubredditNames
    },
    handleSelectSubreddit: function (payload) {
      if (payload.type == "source") {
        this.sourceSubredditQuery = payload.selectedSubredditInput
      }
      if (payload.type == "target") {
        this.targetSubredditQuery = payload.selectedSubredditInput
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
    handleNodeSelected: function (payload) {
      this.$refs.selectSourceSubreddit.selectedSubredditInput = payload
      this.$refs.selectTargetSubreddit.selectedSubredditInput = payload
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
    },
    validateLink(source, target, type) {
      const doesLinkExist = (source, target) => {
        const foundLinks = this.networkData.links.filter(x => x[0] == source && x[1] == target)
        return foundLinks.length > 0 ? true : false
      }
      const linkExists = doesLinkExist(source, target)
      if (!linkExists) {
        if (type == "target") {
          this.addAlert(`Subreddit <strong>${source}</strong> has no posts to <strong>${target}</strong>`)
        } else {
          this.addAlert(`Subreddit <strong>${target}</strong> has no posts from <strong>${source}</strong>`)
        }
        return false
      } else {
        this.removeAllAlerts()
        return true
      }
    },
    addAlert: function (message) {
      this.alerts.push({
        id: Date.now(),
        message: message
      })
    },
    removeAlert: function (alertId) {
      const newAlerts = this.alerts.filter(x => x.id != alertId)
      this.alerts = newAlerts
    },
    removeAllAlerts: function () {
      this.alerts = []
    }
  },
  created: async function () {
    await this.fetchData()
  },
  template: `
    <div id="wrapper">
      <div class="row mt-2">

        <!-- Side bar -->
        <div class="col-md-2 px-1">

          <!-- Spinner/Loading icon -->
          <div v-if="isLoadingData" class="d-flex justify-content-center col">
              <div class="spinner-grow my-2" role="status">
              </div>
          </div>

          <div v-for="alert in alerts" :key="alert.id" class="row"> 
            <div class="col">
              <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Oops!</strong>  
                <span v-html="alert.message">
                  {{ alert.message }}
                </span>
                <button type="button" class="btn-close" @click="removeAlert(alert.id)" aria-label="Close"></button>
              </div>
            </div>
          </div>

          <sidebar-container>
              <info-button
                title="Network graph"
                text="The network graph shows the post interactions between source subreddits and their targets. A subgraph will be shown of the selected source- or target subreddit, which consists of its neighbors and its neighbor's neighbors. Clusters - shown as nodes with a smaller gray center - can be expanded or collapsed by double-clicking on the node."
              >
              </info-button>
              <span v-if="shownSubgraph">
                Showing subgraph of subreddit:</br>
                <a :href="subredditLink" target="_blank" style="font-size: 14px">
                  r/{{ shownSubgraph }}
                </a>
              </span>
              <span v-else>Showing network of top 500 subreddit links by post count</span>
          </sidebar-container>

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
                  ref="selectSourceSubreddit"
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
                  ref="selectTargetSubreddit"
                ></select-subreddit>
              </div>
            </div>
          </div>
        </div>
        <!-- End side bar -->  
      
        <!-- Graph network -->
        <div class="col-md-8 px-1">
          <graph-network
            v-if="networkData"
            v-bind:network-data="networkData"
            v-bind:selected-subreddit="selectedSourceSubreddit"
            v-bind:selected-source-subreddit="selectedSourceSubreddit"
            v-bind:selected-target-subreddit="selectedTargetSubreddit"
            v-bind:show-subreddit-names="showSubredditNames"
            v-bind:show-force-controls="showForceControls"
            v-bind:collapse-all-clusters="collapseAllClusters"
            v-on:node-selected="handleNodeSelected"
            ref="graphNetwork"
          ></graph-network>
        </div>

        <div class="col-md-2 px-1">
        <div class="d-grid">
          <button 
              :title="showForceControls ? 'Hide force controls' : 'Show force controls'" 
              class="btn btn-outline-primary btn-sm mb-1" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#forceControls" 
              aria-expanded="false" 
              aria-controls="forceControls"
              @click="showForceControls = !showForceControls"
          >
              {{ showForceControls ? 'Hide foce controls' : 'Show force controls' }}
          </button>
        </div>

        <sidebar-container>
          <div class="row">
            <div class="col">
              <div class="input-group">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="showSubredditNames" v-on:click="toggleShowSubredditNames" style="background-color: gray;">
                  <label class="form-check-label" for="showSubredditNames">Show subreddit names</label>
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col">
              <div class="input-group">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="collapseAllClusters" v-on:click="collapseAllClusters = !collapseAllClusters" style="background-color: gray;">
                  <label class="form-check-label" for="collapseAllClusters">Expand all clusters</label>
                </div>
              </div>
            </div>
          </div>

          <!-- 
          <div class="row">
            <div class="col">
              <label for="linkSlider" class="form-label">Number of links: {{ numberOfLinksSliderValue }}/137821</label>
              <input type="range" class="form-range" min="0" max="25000" step="50" id="linkSlider" v-model.number="numberOfLinksSliderValue" @click="changeNumberOfLinks">
            </div>
          </div>
          -->
        </sidebar-container>

        <sidebar-container>
          <span class="badge bg-secondary mb-1">Nodes: {{ networkData && networkData.nodes && networkData.nodes.length }}</span>
          <span class="badge bg-secondary">Links: {{ networkData && networkData.links && networkData.links.length }}</span>
        </sidebar-container>

      </div>



      </div>

      <!-- Plots section -->

      <div class="row">
        <div class="col">
              <!--
              <div class="text-center mb-1 border-1"> 
                {{detailsOnDemandCardTitle}}
              </div>
              -->

              <div class="row g-2">
                <div class="col-md-6">
                    <aggregate-container :source-subreddit="selectedSourceSubreddit" :target-subreddit="selectedTargetSubreddit">
                    </aggregate-container>
                </div>
                <div class="col-md-6">
                  <sentiment-box :source-subreddit="selectedSourceSubreddit" :target-subreddit="selectedTargetSubreddit">
                  </sentiment-box>
                </div>
              </div>

              <div class="row g-2">

                <div class="col-md-3">
                    <plot-source-target :source-subreddit="selectedSourceSubreddit" :target-subreddit="selectedTargetSubreddit"></plot-source-target>
                </div>

                <div class="col-md-3">
                    <properties-plot :source-subreddit="selectedSourceSubreddit":target-subreddit="selectedTargetSubreddit">
                    </properties-plot>
                </div>

                <div class="col-md-3">
                    <properties-radar :source-subreddit="selectedSourceSubreddit" :target-subreddit="selectedTargetSubreddit">
                    </properties-radar>
                </div>

                <div class="col-md-3">
                    <correlation-plot :source-subreddit="selectedSourceSubreddit" :target-subreddit="selectedTargetSubreddit">
                    </correlation-plot>
                </div>
              </div> 
          
       </div>
      </div>
    </div>
  `
})
