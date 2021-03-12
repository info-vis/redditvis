Vue.component("aggregates-component", {
  data: function() {
    return {
      isLoading: false,
      myData: 1
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
        const freqObject = await freqResponse.json();
        this.myData = freqObject
    },
  },
  mounted() {
    this.fetchAPIData()
  },
  template: `
  <div>
    <div v-if="isLoading" class="d-flex justify-content-center">
      <div class="spinner-grow my-5" role="status">
      </div>
    </div>
    <div v-show="!isLoading">
        <p class="mb-0 mt-1" >
        <small> <strong> Post Aggregates </strong></small>
        </p>
    </div>
    <div v-show="!isLoading" id="aggregates-component" class="bk-root"></div>

    <pre>{{ myData.data }}</pre>

  </div>
  `
})
