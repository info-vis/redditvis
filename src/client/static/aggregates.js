Vue.component("aggregates-component", {
  data: function () {
    return {
      isLoading: false,
      aggs: 1
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
      this.aggs = freqObject
      this.isLoading = false
    },
  },
  mounted() {
    this.fetchAPIData()
  },
  template: `
  <div class="w-50" v-if="aggs && aggs.data">

    <div class="row">
      <div class="col-md-10">
          <p class="mb-0 mt-1">
              <small> <strong> Aggregate properties of the posts </strong></small>
              <info-button
                  title="Aggregate properties of the posts"
                  text="Properties related to fractions, such as the number of alphabetical characters."
              >
              </info-button>
          </p>
      </div>
      <div class="col-md-2">
          <div v-if="isLoading" class="d-flex justify-content-center">
              <div class="spinner-grow spinner-grow-sm" role="status"></div>
          </div>
      </div>
    </div>

    <div class="card-columns" style="column-count:3">
      <div class="col d-flex align-items-stretch">
        <div class="card" style="background-color: #eeeeee; width: 10rem">
          <div class="card-body" style="text-align:center">
            <h3 class="card-title" style="font-size:25px; color:#408acf">{{ aggs.data["Fraction of alphabetical characters"] }}%</h3>
            <h6 class="card-subtitle mb-2 text-muted" style="font-size:15px">Global Average: {{aggs.data_avg["Fraction of alphabetical characters"]}}%</h6>
            <p class="card-text" style="font-size:12px">Fraction of Alphabetical Characters</p>
          </div>
        </div>
      </div>
      <div class="col d-flex align-items-stretch mt-2">
        <div class="card" style="background-color: #eeeeee; width: 10rem">
          <div class="card-body" style="text-align:center">
            <h3 class="card-title" style="font-size:25px; color:#408acf">{{aggs.data["Fraction of digits"]}}%</h3>
            <h6 class="card-subtitle mb-2 text-muted" style="font-size:15px">Global Average: {{aggs.data_avg["Fraction of digits"]}}%</h6>
            <p class="card-text" style="font-size:12px">Fraction of Digits</p>
          </div>
        </div>
      </div>
      <div class="col d-flex align-items-stretch mt-2">
        <div class="card" style="background-color: #eeeeee; width: 10rem">
          <div class="card-body" style="text-align:center">
            <h3 class="card-title" style="font-size:25px; color:#408acf">{{aggs.data["Fraction of special characters"]}}%</h3>
            <h6 class="card-subtitle mb-2 text-muted" style="font-size:15px">Global Average: {{aggs.data_avg["Fraction of special characters"]}}%</h6>
            <p class="card-text" style="font-size:12px">Fraction of Special Characters</p>
          </div>
        </div>
      </div>
      <div class="col d-flex align-items-stretch mt-2">
        <div class="card" style="background-color: #eeeeee; width: 10rem">
          <div class="card-body" style="text-align:center">
            <h3 class="card-title" style="font-size:25px; color:#408acf">{{aggs.data["Fraction of stopwords"]}}%</h3>
        </div>
        <div class="card" style="background-color: #eeeeee; width: 10rem">
          <div class="card-body" style="text-align:center">
            <h3 class="card-title" style="font-size:25px; color:#408acf">{{aggs.data["Fraction of uppercase characters"]}}%</h3>
            <h6 class="card-subtitle mb-2 text-muted" style="font-size:15px">Global Average: {{aggs.data_avg["Fraction of uppercase characters"]}}%</h6>
            <p class="card-text" style="font-size:12px">Fraction of Uppercase Characters</p>
          </div>
        </div>
      </div>
      <div class="col d-flex align-items-stretch mt-2">
        <div class="card" style="background-color: #eeeeee; width: 10rem">
          <div class="card-body" style="text-align:center">
<<<<<<< HEAD
            <h3 class="card-title" style="font-size:25px; color:#408acf">{{aggs.data["FRACTION_OF_WHITESPACE"]}}%</h3>
            <h6 class="card-subtitle mb-2 text-muted" style="font-size:15px">Global Average: {{aggs.data_avg["FRACTION_OF_WHITESPACE"]}}%</h6>
=======
            <h3 class="card-title" style="font-size:25px; color:#408acf">{{aggs.data["Fraction of white spaces"]}}%</h3>
        </div>
      </div>
  </div>
  `
})
