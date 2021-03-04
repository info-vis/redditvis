// Define a new component called graph-network
Vue.component('graph-network', {
    data: function () {
        // All data prefixed with 'd3' is related to the d3 library.
        return {
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
        width: function() { return this.d3Canvas && this.d3Canvas.width || null },
        height: function() { return this.d3Canvas && this.d3Canvas.height || null }
    },
    props: {
        networkData: Object,
        selectedSubreddit: String,
        showSubredditNames: Boolean, // Show a name label next to each node
    },
    watch: {
        showSubredditNames: "simulationUpdate",
        selectedSubreddit: "simulationUpdate",
        networkData: "init"
    },
    methods: {
        setSelectedSubreddit(subreddit) {
            this.selectedSubreddit = subreddit
        },
        setBackgroundColor(color = "#f5f5f5") {
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
                this.d3Context.lineWidth = Math.round(Math.sqrt(link.value))
            })
            this.d3Context.strokeStyle = "black";
            this.d3Context.stroke();
        },
        drawNode(node, selected = false) {
            const extraRadius = 2 // When a node is selected
            const nodeRadius = selected ? this.d3NodeRadius + extraRadius : this.d3NodeRadius
            this.d3Context.strokeStyle = "#fff";
            this.d3Context.beginPath();
            this.d3Context.lineWidth = 1;
            this.d3Context.moveTo(node.x + nodeRadius, node.y);
            this.d3Context.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);

            this.d3Context.fillStyle = this.color(node);
            this.d3Context.fill();

            const nodeIsSelected = node.id == this.selectedSubreddit
            if (nodeIsSelected) {
                this.drawNodeName(node, offset = 12)
            } else if (this.showSubredditNames) {
                this.drawNodeName(node)
            }
        },
        drawNodeName(node, offset = 8) {
            this.d3Context.fillText(node.id, node.x + offset, node.y);
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
                if (node) {
                    this.d3Context.beginPath();
                    this.drawNode(node, selected = true)
                    this.d3Context.fill();
                    this.d3Context.strokeStyle = "#0d6efd";
                    this.d3Context.lineWidth = 3;
                    this.d3Context.stroke();
                }
            }
        },
        dragSubject(event) {
            const x = this.d3Transform.invertX(event.x);
            const y = this.d3Transform.invertY(event.y);
            const node = this.findNode(this.nodes, x, y, this.d3NodeRadius);
            if (node) {
                node.x = this.d3Transform.applyX(node.x);
                node.y = this.d3Transform.applyY(node.y);
            }
            return node;
        },
        dragStarted(event) {
            if (!event.active) {
                this.d3Simulation.alphaTarget(0.3).restart();
            }
            event.subject.fx = this.d3Transform.invertX(event.x);
            event.subject.fy = this.d3Transform.invertY(event.y);
        },
        dragged(event) {
            event.subject.fx = this.d3Transform.invertX(event.x);
            event.subject.fy = this.d3Transform.invertY(event.y);
        },
        dragEnded(event) {
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
        },
        setDimensionsOfCanvas() {
            var containerDimensions = document.getElementById('graph-network-container').getBoundingClientRect();
            this.d3Canvas.width = containerDimensions.width; // The width of the parent div of the canvas
            this.d3Canvas.height = window.innerHeight / 1.8; // A fraction of the height of the screen
            this.simulationUpdate()
        },
        init() {
            // Transform the rows from being arrays of values to objects.
            this.links = this.networkData.links.map(d => ({ source: d[0], target: d[1], value: d[2] }))
            this.nodes = this.networkData.nodes.map(d => ({ id: d, group: Math.floor(Math.random() * Math.floor(10)) }))

            this.d3Canvas = document.getElementById("graph-network-canvas")
            this.d3Context = this.d3Canvas.getContext("2d", { alpha: false })

            this.setDimensionsOfCanvas()
            this.setBackgroundColor()

            this.d3Simulation = d3.forceSimulation(this.nodes)
                .force("link", d3.forceLink(this.links).id(d => d.id))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(this.width / 2, this.height / 2));

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
        }
    },
    created() {
        window.addEventListener("resize", this.setDimensionsOfCanvas);
    },
    mounted: async function () {
        this.init()
    },
    destroyed() {
        window.removeEventListener("resize", this.setDimensionsOfCanvas);
    },
    template: `
        <div id="graph-network-container">
            <canvas id="graph-network-canvas" class="shadow-sm rounded border" style="width: 100%">
            </canvas>
        </div>
    `
})
