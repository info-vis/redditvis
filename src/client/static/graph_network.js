// Define a new component called graph-network
Vue.component('graph-network', {
    data: function () {
        // All data prefixed with 'd3' is related to the d3 library.
        return {
            showSubredditNames: true, // Show a name label next to each node
            data: {}, // This contains the nodes and links
            numberOfLinks: 2000, // This controls the size of the network
            isLoading: true, // When the data is loading, this will be true
            height: 500, // of the canvas
            width: 1000, // of the canvas
            selectedSubreddit: "books",
            links: null,
            nodes: null,

            d3Simulation: null,
            d3Canvas: null,
            d3Context: null,
            d3Transform: d3.zoomIdentity,
            d3Scale: d3.scaleOrdinal(d3.schemeCategory10),
            d3NodeRadius: 6,
        }   
    },
    computed: {
        subredditLink: function () {
            return `https://www.reddit.com/r/${this.selectedSubreddit}/`
        }
    },
    watch: {
        showSubredditNames: "simulationUpdate",
        selectedSubreddit: "simulationUpdate"
    },
    methods: {
        /**
         * Fetch data and set this.data.
         */
        fetchData: async function() {
            const response = await fetch(`${apiEndpoint}network?n_links=${this.numberOfLinks}`);
            const data = await response.json();
            this.data = await data
        },
        setSelectedSubreddit(subreddit) {
            this.selectedSubreddit = subreddit
        },
        setBackgroundColor(color="#f5f5f5") {
            this.d3Context.fillStyle = color;
            this.d3Context.fillRect(0, 0, this.d3Canvas.width, this.d3Canvas.height);
        },
        simulationUpdate() {
            this.d3Context.save();
            this.clearCanvas()
            this.setBackgroundColor()
            this.d3Context.translate(this.d3Transform.x, this.d3Transform.y);
            this.d3Context.scale(this.d3Transform.k, this.d3Transform.k);
            this.drawLinks(this.links)
            for (const node of this.nodes) {
                this.drawNode(node) 
            }
            this.drawSelectedSubreddit()
            this.d3Context.restore();
        },
        zoomed(event) {
            this.d3Transform = event.transform
            this.simulationUpdate()
        },
        color(d) {
            return this.d3Scale(d.group)
        },
        clearCanvas() {
            this.d3Context.clearRect(0, 0, this.width, this.height);
        },
        drawLinks(links) {
            this.d3Context.beginPath();
            links.forEach(link => {
                this.d3Context.moveTo(link.source.x, link.source.y);
                this.d3Context.lineTo(link.target.x, link.target.y);
                this.d3Context.lineWidth = link.value / 15
            })
            this.d3Context.strokeStyle = "#aaa";
            this.d3Context.stroke();
        },
        drawNode(node, selected=false) {
            const extraRadius = 5 // When a node is selected
            const nodeRadius = selected ? this.d3NodeRadius + extraRadius : this.d3NodeRadius
            this.d3Context.strokeStyle = "#fff";
            this.d3Context.beginPath();
            this.d3Context.lineWidth = 1;
            this.d3Context.moveTo(node.x + nodeRadius, node.y);
            this.d3Context.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);

            this.d3Context.fillStyle = this.color(node);
            this.d3Context.fill();
            
            if (this.showSubredditNames) {
                this.d3Context.fillText(node.id, node.x + 8, node.y);
            }
        },
        findNodeById(id) {
            return this.nodes.filter(node => node.id == id)[0]
        },
        panToSelectedSubreddit() {
            const selectedNode = this.findNodeById(this.selectedSubreddit)
            const x = selectedNode.x
            const y = selectedNode.y
            const zoomLevel = 2
            const transform = d3.zoomIdentity.translate(this.width / 2, this.height / 2).scale(zoomLevel).translate(-x, -y)
            this.d3Transform = transform
            d3.select(this.d3Canvas).call(d3.zoom().transform, transform)
            this.simulationUpdate()
        },
        drawSelectedSubreddit() {
            if (this.selectedSubreddit) {
                const node = this.findNodeById(this.selectedSubreddit)
                this.d3Context.beginPath();
                this.drawNode(node, selected=true)
                this.d3Context.fill();
                this.d3Context.strokeStyle = "#ff0000";
                this.d3Context.stroke();
            }
        },
        dragSubject(event) {
            const x = this.d3Transform.invertX(event.x);
            const y = this.d3Transform.invertY(event.y);
            const node = this.findNode(this.nodes, x, y, this.d3NodeRadius);
            if (node) {
                node.x =  this.d3Transform.applyX(node.x);
                node.y = this.d3Transform.applyY(node.y);
            }
            return node;
        },
        dragStarted(event) {
            console.log('dragstarted')
            if (!event.active) {
                this.d3Simulation.alphaTarget(0.3).restart();
            }
            event.subject.fx = this.d3Transform.invertX(event.x);
            event.subject.fy = this.d3Transform.invertY(event.y);
        },
        dragged(event) {
            console.log('dragged')

            event.subject.fx = this.d3Transform.invertX(event.x);
            event.subject.fy = this.d3Transform.invertY(event.y);
        },
        dragEnded(event) {
            console.log('dragended')
            
            if (!event.active) this.d3Simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        },
        findNode(nodes, x, y, radius) {
            const rSq = radius * radius;
            let i;
            for (i = nodes.length - 1; i >= 0; --i) {
              const node = nodes[i],
                    dx = x - node.x,
                    dy = y - node.y,
                    distSq = (dx * dx) + (dy * dy);
              if (distSq < rSq) {
                return node;
              }
            }
            // No node selected
            return undefined; 
        }
    },
    mounted: async function() {
        const width = this.width
        const height = this.height

        await this.fetchData()
        this.isLoading = false
  
        // Transform the rows from being arrays of values to objects.
        this.links = this.data.links.map(d => ({source: d[0], target: d[1], value: d[2]}))
        this.nodes = this.data.nodes.map(d => ({id: d, group: Math.floor(Math.random() * Math.floor(10))}))
      
        this.d3Canvas = document.getElementById("graph-network-canvas")
        this.d3Context = this.d3Canvas.getContext("2d")

        this.setBackgroundColor()
        
        this.d3Simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.links).id(d => d.id))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));
        
        this.d3Simulation.on("tick", this.simulationUpdate);

        d3.select(this.d3Context.canvas)
            .call(d3.drag()
                .subject(this.dragSubject)
                .on("start", this.dragStarted)
                .on("drag", this.dragged)
                .on("end", this.dragEnded))
            .call(d3.zoom()
                .scaleExtent([0.1, 8])
                .on("zoom", this.zoomed))
            .on("wheel", event => event.preventDefault())
    },
    template: `
        <div>
            <div class="row">
                <div class="col mb-2">
                    <div class="row my-2">
                        <div v-if="this.isLoading" class="d-flex justify-content-center col">
                            <div class="spinner-grow mt-5" role="status">
                            </div>
                        </div>
                        <div class="col" v-if="!this.isLoading">
                            <p class="m-2">
                                Nodes: <span class="badge bg-secondary">{{ this.data.nodes && this.data.nodes.length }}</span>
                                Links: <span class="badge bg-secondary">{{ this.data.links && this.data.links.length }}</span>
                            </p>
                        </div>
                        <div class="col" v-if="!this.isLoading">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="showSubredditNames" v-on:click="showSubredditNames = !showSubredditNames" checked>
                                <label class="form-check-label" for="showSubredditNames">Show subreddit names</label>
                            </div>
                        </div>
                        <div class="col" v-if="!this.isLoading">
                            <div id="tooltip">
                                Selected subreddit: 
                                <a  v-if="selectedSubreddit"
                                    class="btn btn-primary" 
                                    target="_blank" 
                                    v-bind:href="subredditLink"
                                    role="button"
                                    v-bind:title="subredditLink"
                                >
                                    r/{{ selectedSubreddit }}
                                </a>
                            </div>
                        </div>
                        <div class="col" v-if="!this.isLoading">
                            <button class="btn btn-primary" v-bind:disabled="!selectedSubreddit" @click="panToSelectedSubreddit">
                                Pan to selection
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="">
                <div class="">
                    <canvas id="graph-network-canvas" class="shadow-sm rounded border" v-bind:style="{width: width, height: height}" :width="this.width + 'px'" :height="this.height + 'px'">
                    </canvas>
                </div>
            </div>
        </div>
    `
  })

