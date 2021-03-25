Vue.component("aggregates-component", {
  data: function() {
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
        const freqObject = await freqResponse.json();
        this.aggregateData = freqObject
    },
  },
  mounted() {
    this.fetchAPIData()
  },
  template: `
  <div class="w-50" v-if="aggregateData && aggregateData.data">
    <strong>Aggregate properties of the posts</strong>
    <div class="card-columns" style="column-count:3">
      <div class="col d-flex align-items-stretch">
        <div class="card" style="background-color: #eeeeee; width: 10rem">
          <div class="card-body" style="text-align:center">
            <h3 class="card-title" style="font-size:25px; color:#408acf">{{ aggregateData.data["Fraction of alphabetical characters"] }}%</h3>
            <h6 class="card-subtitle mb-2 text-muted" style="font-size:15px">Global Average: {{aggregateData.data_avg["Fraction of alphabetical characters"]}}%</h6>
            <p class="card-text" style="font-size:12px">Fraction of Alphabetical Characters</p>
          </div>
        </div>
      </div>
      <div class="col d-flex align-items-stretch mt-2">
        <div class="card" style="background-color: #eeeeee; width: 10rem">
          <div class="card-body" style="text-align:center">
            <h3 class="card-title" style="font-size:25px; color:#408acf">{{aggregateData.data["Fraction of digits"]}}%</h3>
            <h6 class="card-subtitle mb-2 text-muted" style="font-size:15px">Global Average: {{aggregateData.data_avg["Fraction of digits"]}}%</h6>
            <p class="card-text" style="font-size:12px">Fraction of Digits</p>
          </div>
        </div>
      </div>
      <div class="col d-flex align-items-stretch mt-2">
        <div class="card" style="background-color: #eeeeee; width: 10rem">
          <div class="card-body" style="text-align:center">
            <h3 class="card-title" style="font-size:25px; color:#408acf">{{aggregateData.data["Fraction of special characters"]}}%</h3>
            <h6 class="card-subtitle mb-2 text-muted" style="font-size:15px">Global Average: {{aggregateData.data_avg["Fraction of special characters"]}}%</h6>
            <p class="card-text" style="font-size:12px">Fraction of Special Characters</p>
          </div>
        </div>
      </div>
      <div class="col d-flex align-items-stretch mt-2">
        <div class="card" style="background-color: #eeeeee; width: 10rem">
          <div class="card-body" style="text-align:center">
            <h3 class="card-title" style="font-size:25px; color:#408acf">{{aggregateData.data["Fraction of stopwords"]}}%</h3>
            <h6 class="card-subtitle mb-2 text-muted" style="font-size:15px">Global Average: {{aggregateData.data_avg["Fraction of stopwords"]}}%</h6>
            <p class="card-text" style="font-size:12px">Fraction of Stopwords</p>
          </div>
        </div>
      </div>
      <div class="col d-flex align-items-stretch mt-2">
        <div class="card" style="background-color: #eeeeee; width: 10rem">
          <div class="card-body" style="text-align:center">
            <h3 class="card-title" style="font-size:25px; color:#408acf">{{aggregateData.data["Fraction of uppercase characters"]}}%</h3>
            <h6 class="card-subtitle mb-2 text-muted" style="font-size:15px">Global Average: {{aggregateData.data_avg["Fraction of uppercase characters"]}}%</h6>
            <p class="card-text" style="font-size:12px">Fraction of Uppercase Characters</p>
          </div>
        </div>
      </div>
      <div class="col d-flex align-items-stretch mt-2">
        <div class="card" style="background-color: #eeeeee; width: 10rem">
          <div class="card-body" style="text-align:center">
            <h3 class="card-title" style="font-size:25px; color:#408acf">{{aggregateData.data["Fraction of white spaces"]}}%</h3>
            <h6 class="card-subtitle mb-2 text-muted" style="font-size:15px">Global Average: {{aggregateData.data_avg["Fraction of white spaces"]}}%</h6>
            <p class="card-text" style="font-size:12px">Fraction of Whitespace</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
