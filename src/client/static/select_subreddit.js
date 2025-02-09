Vue.component('select-subreddit', {
    data: function () {
        return {
            selectedSubredditInput: null
        }
    },
    props: {
        type: String,
        selectedSubreddit: String,
        subredditOptions: Array,
        borderColor: {
            type: String,
            default: "#dee2e6"
        }
    },
    computed: {
        subredditLink: function () {
            return `https://www.reddit.com/r/${this.selectedSubreddit}/`
        },
        styleObject() {
            return {
                border: `1px solid ${this.borderColor}`,
            }
        },
        subredditOptionsId() {
            return `subreddit-options-${this.type}`
        },
    },
    methods: {
        selectSubreddit() {
            this.$emit("select-subreddit", {
                type: this.type,
                selectedSubredditInput: this.selectedSubredditInput
            })
        },
        clearSubreddit() {
            this.$emit('clear-subreddit', this.type)
            this.selectedSubredditInput = null
        }
    },
    template: `
    <!-- Selection -->
    <div class="row">
        <div class="col">
            <div class="p-2 rounded" :style="styleObject">
                    <!-- Source selection -->
                    <div class="row">
                        <div class="col">
                            <strong>Selected {{ type }} subreddit:</strong> 
                            <div style="font-size: 14px">
                                <a v-if="selectedSubreddit"
                                    target="_blank" 
                                    v-bind:href="subredditLink"
                                    role="button"
                                    v-bind:title="subredditLink"
                                >
                                    r/{{ selectedSubreddit }}
                                </a>
                                <div v-if="!selectedSubreddit" style="font-size: 12px" >None</div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col">
                            <div class="my-2">
                                <div class="row">
                                    <div class="col-7">
                                        <label for="selectSubredditInput" class="form-label">Select a subreddit</label>
                                    </div>
                                    <div class="col">
                                        <div class="float-end">
                                            <button class="btn btn-primary btn-sm btn-secondary" v-bind:disabled="!selectedSubreddit" @click="$emit('pan-to-subreddit', type)">
                                                <i class="bi bi-geo-fill"></i>              
                                            </button>
                                            <button class="btn btn-danger btn-sm" v-bind:disabled="!selectedSubreddit" @click="clearSubreddit">
                                                <i class="bi bi-x-circle"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="row g-1">
                                    <div class="col-md-10">
                                        <input
                                            class="form-control" 
                                            :list="subredditOptionsId"
                                            placeholder="Type a subreddit name.."
                                            v-on:keyup.enter="selectSubreddit"
                                            v-model="selectedSubredditInput"
                                        >
                                        <datalist :id="subredditOptionsId">
                                            <option v-for="subreddit in subredditOptions">{{ subreddit }}</option>
                                        </datalist>
                                    </div>

                                    <div class="col-md-2 d-grid">
                                        <button @click="selectSubreddit" :disabled="!selectedSubredditInput" class="btn btn-primary btn-sm">
                                            <i class="bi bi-caret-right-fill"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>        
                        </div>
                    </div>
            </div>
        </div>
    </div>
    <!-- End Selection -->
    `
})
