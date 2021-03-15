Vue.component("aggregates-component", {
  data: function() {
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
    },
  },
  mounted() {
    this.fetchAPIData()
  },
  template: `
  <div>
    <div class="row">
      <div class="col">
        <div class="card" style="height: 10rem;background-color: #eeeeee">
          <div class="card-body">
            <h5 class="card-title">Fraction of Alphabetical Characters</h5>
            <p class="card-text">{{aggs.data["FRACTION_OF_ALPHABETICAL_CHARS"]}}%</p>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card" style="height: 10rem;background-color: #eeeeee">
          <div class="card-body">
            <h5 class="card-title">Fraction of Digits</h5>
            <p class="card-text">{{aggs.data["FRACTION_OF_DIGITS"]}}%</p>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card" style="height: 10rem;background-color: #eeeeee">
          <div class="card-body">
            <h5 class="card-title">Fraction of Special Characters</h5>
            <p class="card-text">{{aggs.data["FRACTION_OF_SPECIAL_CHARS"]}}%</p>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card" style="height: 10rem;background-color: #eeeeee">
          <div class="card-body">
            <h5 class="card-title">Fraction of Stopwords</h5>
            <p class="card-text">{{aggs.data["FRACTION_OF_STOPWORDS"]}}%</p>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card" style="height: 10rem;background-color: #eeeeee">
          <div class="card-body">
            <h5 class="card-title">Fraction of Uppercase Characters</h5>
            <p class="card-text">{{aggs.data["FRACTION_OF_UP_CHARS"]}}%</p>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card" style="height: 10rem;background-color: #eeeeee">
          <div class="card-body">
            <h5 class="card-title">Fraction of Whitespace</h5>
            <p class="card-text">{{aggs.data["FRACTION_OF_WHITESPACE"]}}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
