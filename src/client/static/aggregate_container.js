Vue.component("aggregate-container", {
  data: function () {
    return {
      isLoading: false,
      aggregateData: null
    }
  },
  props: {
    sourceSubreddit: String,
    targetSubreddit: String
  },
  watch: {
    sourceSubreddit: "fetchAPIData",
    targetSubreddit: "fetchAPIData"
  },
  methods: {
    async fetchAPIData() {
      this.isLoading = true
      let url = `${apiEndpoint}aggregates`
      const sourceSubredditQuery = `source-subreddit=${this.sourceSubreddit}`
      const targetSubredditQuery = `target-subreddit=${this.targetSubreddit}`
      if (this.sourceSubreddit && this.targetSubreddit) {
        url = url + "?" + sourceSubredditQuery + "&" + targetSubredditQuery
      } else if (this.sourceSubreddit) {
        url = url + "?" + sourceSubredditQuery
      } else if (this.targetSubreddit) {
        url = url + "?" + targetSubredditQuery
      }
      const freqResponse = await fetch(url);
      this.aggregateData = await freqResponse.json();
      this.isLoading = false
    },
  },
  mounted() {
    this.fetchAPIData()
  },
  template: `
  <div>
      <div class="row">
        <div class="col">
            <div v-if="isLoading" class="d-flex justify-content-center">
                <div class="spinner-grow spinner-grow-sm" role="status"></div>
            </div>
        </div>
      </div>

      <div class="card-group" v-if="aggregateData && aggregateData.data">
        <aggregate-component
          title="Number of posts"
          :value="aggregateData.data['Number of posts']"
        ></aggregate-component>

        <aggregate-component
          title="Avg word length"
          :value="aggregateData.data['Average word length']"
          :globalAverage="aggregateData.data_avg['Average word length']"
        ></aggregate-component>

        <aggregate-component
          title="Avg # words per sentence"
          :value="aggregateData.data['Average number of words per sentence']"
          :globalAverage="aggregateData.data_avg['Average number of words per sentence']"
        ></aggregate-component>
        
        <aggregate-component
          title="Automated Readability Index"
          :value="aggregateData.data['Automated readability index']"
          :globalAverage="aggregateData.data_avg['Automated readability index']"
        >
          <info-button
            title="Automated Readability index"
            text="The automated readability index (ARI) is a readability test for English texts, 
              designed to gauge the understandability of a text. It produces an approximate representation of 
              the US grade level needed to comprehend the text."
          ></info-button>
        </aggregate-component>
      </div>

    </div>
  `
})
