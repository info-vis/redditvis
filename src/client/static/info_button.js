let autoIncrementId = 0;

Vue.component('info-button', {
    data: function () {
        return {
            id: null,
            styleObject: {
                color: "#9e9e9e",
                "font-size": "16px",
                padding: "0px",
                "background-color": "#fafafa",
                border: "none",
            }
        }
    },
    props: {
        title: String,
        text: String
    },
    computed: {
        elementId() {
            return `popover${this.id}`
        }
    },
    methods: {
        setUniqueId() {
            this.id = autoIncrementId.toString();
            autoIncrementId += 1;
        },
        initializePopover() {
            var exampleEl = document.getElementById(this.id)
            new bootstrap.Popover(exampleEl, {
                container: `#${this.elementId}`, // Ensure that the popover will always be contained in the container
                fallbackPlacements: ['left', 'right', 'top', 'bottom'] // Possible placements when the popover will move out of view
            })
        }
    },
    created() {
        this.setUniqueId()
    },
    mounted() {
        this.initializePopover()
    },
    template: `
        <span :id="elementId">
            <a
                :id="id"
                tabindex="0"
                class="btn btn-secondary btn-sm"
                role="button"
                :style="styleObject"
                data-bs-trigger="focus"
                v-bind:data-bs-toggle="elementId"
                v-bind:title="title"
                v-bind:data-bs-content="text"
            >
                <i class="bi bi-info-square" style="font-size: 13px"></i>
            </a>
        </span>
    `
})
