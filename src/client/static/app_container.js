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
      filterValue: null
    }
  },
  computed: {
    subredditSelectOptions() {
      if (!this.selectedSourceSubreddit) {
        return this.networkData && this.networkData.nodes
      }
      const targetsOfSelectedSourceSubreddit = this.networkData.links.filter((link) => {
        const source = link[0]
        if (source == this.selectedSourceSubreddit) {
          return link
        }
      }).map(link => link[1])
      return targetsOfSelectedSourceSubreddit
    },
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
        this.$refs.graphNetwork.panToSubreddit(this.selectedSourceSubreddit)
      }
      if (payload == "target") {
        this.$refs.graphNetwork.panToSubreddit(this.selectedTargetSubreddit)
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
    submitFilter: function (event) {
      const input = event.target.value
      if (this.networkData.nodes.includes(this.filterValue)) {
        this.selectedSourceSubreddit = this.filterValue
      }
    },
    changeNumberOfLinks: function () {
      this.numberOfLinks = this.numberOfLinksSliderValue
      this.fetchData()
    },
    clearFilters: function () {
      this.filterValue = null
      this.selectedSourceSubreddit = null
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

      <div class="row my-3">

        <!-- Graph network -->
        <div class="col-md-9 mb-2">
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
        <div class="col-md-3">

          <div class="row border p-1 mb-1 rounded me-2 bg-light">
            <div class="col">
                <span class="badge bg-secondary mb-1">Nodes: {{ networkData && networkData.nodes && networkData.nodes.length }}</span>
                <span class="badge bg-secondary">Links: {{ networkData && networkData.links && networkData.links.length }}</span>
            </div>
          </div>

          <select-subreddit
            type="source"
            backgroundColor="#81d4fa"
            :selectedSubreddit="selectedSourceSubreddit"
            :subredditOptions="networkData && networkData.nodes"
            v-on:select-subreddit="handleSelectSubreddit"
            v-on:pan-to-subreddit="handlePanToSubreddit"
            v-on:clear-subreddit="handleClearSubreddit"
          ></select-subreddit>

          <select-subreddit
            type="target"
            backgroundColor="#ffcc80"
            :selectedSubreddit="selectedTargetSubreddit"
            :subredditOptions="subredditSelectOptions"
            v-on:select-subreddit="handleSelectSubreddit"
            v-on:pan-to-subreddit="handlePanToSubreddit"
            v-on:clear-subreddit="handleClearSubreddit"
          ></select-subreddit>

          <!-- Graph Controls -->
          <div class="row border p-1 my-1 rounded me-2 bg-light">
            <div class="col">

              <div class="row">
                <div class="input-group mb-3">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="showSubredditNames" v-on:click="toggleShowSubredditNames">
                    <label class="form-check-label" for="showSubredditNames">Show subreddit names</label>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col">
                  <label for="linkSlider" class="form-label">Number of links: {{ numberOfLinksSliderValue }}/137821</label>
                  <input type="range" class="form-range" min="0" max="137821" step="1000" id="linkSlider" v-model.number="numberOfLinksSliderValue" @click="changeNumberOfLinks">
                </div>
              </div>

            </div>
          </div>
          <!-- End Graph Controls -->

        </div>
        <!-- End side bar -->
      </div>

      <!-- Plots section -->
      <div class="row my-3 border rounded mx-1">
        <div class="col">
          <properties-plot 
            :source-subreddit="selectedSourceSubreddit"
            :target-subreddit="selectedTargetSubreddit"
          ></properties-plot>
        </div>
        <div class="col">
          <sentiment-box :source-subreddit="selectedSourceSubreddit"></sentiment-box>
        </div>
        <div class="col">
          <plot-source-target :source-subreddit="selectedSourceSubreddit" v-if="selectedSourceSubreddit"></plot-source-target>
        </div>    
      </div>
    </div>
    `
})


// <!-- Selection -->
//           <div class="row border p-1 my-1 rounded me-2 bg-light">
//             <div class="col">

//               <!-- Source selection -->
//               <div class="row pb-2">
//                 <div class="col">
//                   <div id="select-source-subreddit">
//                     <strong>Selected source subreddit:</strong> 
//                     <div>
//                       <a v-if="selectedSourceSubreddit"
//                         class="" 
//                         target="_blank" 
//                         v-bind:href="subredditLink"
//                         role="button"
//                         v-bind:title="subredditLink"
//                       >
//                         r/{{ selectedSourceSubreddit }}
//                       </a>
//                     </div>
//                     <div v-if="!selectedSourceSubreddit">None</div>
//                   </div>
//                 </div>
//               </div>

//               <div class="row float-end">
//                 <div class="col px-0">
//                   <button class="btn btn-primary btn-sm" v-bind:disabled="!selectedSourceSubreddit" @click="panToSelectedSourceSubreddit">
//                     <i class="bi bi-geo-fill"></i>              
//                   </button>
//                 </div>
//                 <div class="col">
//                   <button class="btn btn-danger btn-sm" v-bind:disabled="!selectedSourceSubreddit" @click="clearFilters">
//                     <i class="bi bi-x-circle"></i>
//                   </button>
//                 </div>
//               </div>

//               <div class="row">
//                 <form v-on:submit.prevent="submitFilter">
//                   <div class="mb-2">
//                       <label for="exampleDataList" class="form-label">Select a subreddit</label>
//                       <input v-on:keyup.enter="submitFilter" v-model="filterValue" class="form-control" list="datalistOptions" id="exampleDataList" placeholder="Type a subreddit name..">
//                       <datalist v-if="networkData" id="datalistOptions">
//                           <option v-for="subreddit in networkData.nodes">{{ subreddit }}</li></option>
//                       </datalist>
//                   </div>
//                   <button type="submit" class="btn btn-primary">Select source subreddit</button>
//                 </form>
//               </div>

//             </div>
//           </div>
//           <!-- End Selection -->