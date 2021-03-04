Vue.component('select-subreddit', {
    data: function () {
        return {
            selectedSubredditInput: null
        }
    },
    props: {
        type: String,
        selectedSubreddit: String,
        subredditOptions: Array
    },
    computed: {
        subredditLink: function () {
            return `https://www.reddit.com/r/${this.selectedSubreddit}/`
        }
    },
    methods: {
        selectSubreddit() {
            if (this.subredditOptions.includes(this.selectedSubredditInput)) {
                this.$emit("select-subreddit", {
                    type: this.type,
                    selectedSubredditInput: this.selectedSubredditInput
                })
            }
        },
        clearSubreddit() {
            this.$emit('clear-subreddit', this.type)
            this.selectedSubredditInput = null
        }
    },
    template: `
    <!-- Selection -->
    <div class="row border p-1 my-1 rounded me-2 bg-light">
        <div class="col">

            <!-- Source selection -->
            <div class="row pb-2">
                <div class="col">
                    <strong>Selected {{ type }} subreddit:</strong> 
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

            <div class="row float-end">
                <div class="col px-0">
                    <button class="btn btn-primary btn-sm" v-bind:disabled="!selectedSubreddit" @click="$emit('pan-to-subreddit', type)">
                    <i class="bi bi-geo-fill"></i>              
                    </button>
                </div>
                <div class="col">
                    <button class="btn btn-danger btn-sm" v-bind:disabled="!selectedSubreddit" @click="clearSubreddit">
                    <i class="bi bi-x-circle"></i>
                    </button>
                </div>
            </div>

            <div class="row">
                <div class="mb-2">
                    <label for="selectSubredditInput" class="form-label">Select a subreddit</label>
                    <input 
                        id="selectSubredditInput" 
                        class="form-control" 
                        list="subredditOptions"
                        placeholder="Type a subreddit name.."
                        v-on:keyup.enter="selectSubreddit"
                        v-model="selectedSubredditInput"
                    >
                    <datalist id="subredditOptions">
                        <option v-for="subreddit in subredditOptions">{{ subreddit }}</li></option>
                    </datalist>
                </div>
                <button @click="selectSubreddit" class="btn btn-primary">Select {{ type }} subreddit</button>
            </div>

        </div>
    </div>
    <!-- End Selection -->
    `
})
