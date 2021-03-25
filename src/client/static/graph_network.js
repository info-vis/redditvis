// Initial state for the force related data. Used to reset the state programmatically.
function d3ForceInitialState() {
    return {
        d3ForceChargeStrength: -30,
        d3ForceChargeTheta: 0.9,
        d3ForceChargeDistanceMin: 1,
        d3ForceChargeDistanceMax: Infinity,
        d3ForceLinkDistance: 30,
        d3ForceCenterStrength: 1
    }
}

// Define a new component called graph-network
Vue.component('graph-network', {
    data: function () {
        // All data prefixed with 'd3' is related to the d3 library.
        return {
            links: null,
            nodes: null,
            collapseAll: true,

            d3Simulation: null,
            d3Canvas: null,
            d3Context: null,
            d3Transform: null,
            d3Scale: d3.scaleOrdinal(d3.schemeCategory10),
            d3NodeRadius: 5,
            d3LinkWidth: 1,
            ...d3ForceInitialState(),
            selectedNode: null
        }
    },
    computed: {
        width: function () { return this.d3Canvas && this.d3Canvas.width || null },
        height: function () { return this.d3Canvas && this.d3Canvas.height || null },
        getNodesToDraw() {
            return this.nodes.filter(node => (!node.collapsed || node.type != "child"))
        },
        getLinksToDraw() {
            const nodeIdsToDraw = this.getNodesToDraw.map(x => x.id)
            return this.links.filter(link => (
                nodeIdsToDraw.includes(link.source.id) && nodeIdsToDraw.includes(link.target.id)
            ))
        },
    },
    props: {
        networkData: Object,
        selectedSourceSubreddit: String,
        selectedTargetSubreddit: String,
        showSubredditNames: Boolean, // Show a name label next to each node
    },
    watch: {
        showSubredditNames: "simulationUpdate",
        selectedSourceSubreddit: function (newSubreddit, oldSubreddit) {
            this.expandNode(newSubreddit, oldSubreddit)
            this.simulationUpdate()
        },
        selectedTargetSubreddit: function (newSubreddit, oldSubreddit) {
            this.expandNode(newSubreddit, oldSubreddit)
            this.simulationUpdate()
        },
        networkData: "handleNetworkDataChange",
        nodes: "handleNodesChange",
        d3ForceChargeStrength: function () {
            this.setForceSimulation()
        },
        d3ForceChargeTheta: function () {
            this.setForceSimulation()
        },
        d3ForceLinkDistance: function () {
            this.setForceSimulation()
        },
        d3ForceChargeDistanceMin: function () {
            this.setForceSimulation()
        },
        d3ForceChargeDistanceMin: function () {
            this.setForceSimulation()
        },
        d3ForceCenterStrength: function () {
            this.setForceSimulation()
        },
        collapseAll: "toggleCollapseAllChildren"
    },
    methods: {
        setBackgroundColor(color = "white") {
            this.d3Context.fillStyle = color;
            this.d3Context.fillRect(0, 0, this.d3Canvas.width, this.d3Canvas.height);
        },
        simulationUpdate() { // Runs on each 'tick' of the simulation
            this.d3Context.save();
            this.clearCanvas()
            this.setBackgroundColor()

            this.d3Context.translate(this.d3Transform.x, this.d3Transform.y);
            this.d3Context.scale(this.d3Transform.k, this.d3Transform.k);

            // Draw the links
            const linksToDraw = this.getLinksToDraw
            this.drawLinks(linksToDraw)
            this.drawArrows(linksToDraw)
            // Draw the nodes
            const nodesToDraw = this.getNodesToDraw
            nodesToDraw.forEach(node => this.drawNode(node, this.d3NodeRadius))
            this.drawSelectedNode()
            this.drawSelectedSubreddits()

            this.d3Context.restore();
        },
        zoomed(event) {
            this.d3Transform = event.transform
            this.simulationUpdate()
        },
        colorNode(d) {
            return this.d3Scale(d.group)
        },
        clearCanvas() {
            this.d3Context.clearRect(0, 0, this.width, this.height);
        },
        drawLinks(links) {
            const getColor = () => "#bdbdbd";
            const getWidth = () => this.d3LinkWidth;
            const getCurvature = () => .3;

            links.forEach(calcLinkControlPoints); // calculate curvature control points for all visible links

            // Bundle strokes per unique color/width for performance optimization
            const linksPerColor = indexBy(links, [getColor, getWidth]);

            this.d3Context.save();
            Object.entries(linksPerColor).forEach(([color, linksPerWidth]) => {
                const lineColor = !color || color === 'undefined' ? 'rgba(0,0,0,0.15)' : color;
                Object.entries(linksPerWidth).forEach(([width, links]) => {
                    this.d3Context.beginPath();
                    links.forEach(link => {
                        const start = link.source;
                        const end = link.target;

                        if (!start || !end || !start.hasOwnProperty('x') || !end.hasOwnProperty('x')) return; // skip invalid link

                        this.d3Context.moveTo(start.x, start.y);

                        const controlPoints = link.__controlPoints;
                        if (!controlPoints) { // Straight line
                            this.d3Context.lineTo(end.x, end.y);
                        } else {
                            // Use quadratic curves for regular lines and bezier for loops
                            this.d3Context[controlPoints.length === 2 ? 'quadraticCurveTo' : 'bezierCurveTo'](...controlPoints, end.x, end.y);
                        }
                    });
                    this.d3Context.strokeStyle = lineColor;
                    this.d3Context.lineWidth = width;
                    this.d3Context.stroke();
                });
            });
            this.d3Context.restore();

            // Used for creating curved lines
            function calcLinkControlPoints(link) {
                const curvature = getCurvature(link);

                if (!curvature) { // straight line
                    link.__controlPoints = null;
                    return;
                }

                const start = link.source;
                const end = link.target;
                if (!start || !end || !start.hasOwnProperty('x') || !end.hasOwnProperty('x')) return; // skip invalid link

                const lineLen = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)); // line length

                if (lineLen > 0) {
                    const a = Math.atan2(end.y - start.y, end.x - start.x); // line angle
                    const d = lineLen * curvature; // control point distance

                    const cp = { // control point
                        x: (start.x + end.x) / 2 + d * Math.cos(a - Math.PI / 2),
                        y: (start.y + end.y) / 2 + d * Math.sin(a - Math.PI / 2)
                    };

                    link.__controlPoints = [cp.x, cp.y];
                } else { // Same point, draw a loop
                    const d = curvature * 70;
                    link.__controlPoints = [end.x, end.y - d, end.x + d, end.y];
                }
            }
        },
        drawArrows(links) {
            const ARROW_WH_RATIO = 1;
            const ARROW_VLEN_RATIO = .2;
            links.forEach(link => {
                const arrowLength = 5

                this.d3Context.beginPath();

                const start = link.source
                const end = link.target

                if (!start || !end || !start.hasOwnProperty('x') || !end.hasOwnProperty('x')) return; // skip invalid link

                const startR = 2
                const endR = 2
                const relPos = .50 // Changes based on angle of line
                const arrowRelPos = Math.min(1, Math.max(0, relPos));
                const arrowColor = "#9e9e9e";
                const arrowHalfWidth = arrowLength / ARROW_WH_RATIO / 2;

                const bzLine = new Bezier(start.x, start.y, ...link.__controlPoints, end.x, end.y);

                const getCoordsAlongLine = bzLine
                    ? t => bzLine.get(t) // get position along bezier line
                    : t => ({            // straight line: interpolate linearly
                        x: start.x + (end.x - start.x) * t || 0,
                        y: start.y + (end.y - start.y) * t || 0
                    });

                const lineLen = bzLine
                    ? bzLine.length()
                    : Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

                const posAlongLine = startR + arrowLength + (lineLen - startR - endR - arrowLength) * arrowRelPos;

                const arrowHead = getCoordsAlongLine(posAlongLine / lineLen);
                const arrowTail = getCoordsAlongLine((posAlongLine - arrowLength) / lineLen);
                const arrowTailVertex = getCoordsAlongLine((posAlongLine - arrowLength * (1 - ARROW_VLEN_RATIO)) / lineLen);

                const arrowTailAngle = Math.atan2(arrowHead.y - arrowTail.y, arrowHead.x - arrowTail.x) - Math.PI / 2;

                this.d3Context.beginPath();

                this.d3Context.moveTo(arrowHead.x, arrowHead.y);
                this.d3Context.lineTo(arrowTail.x + arrowHalfWidth * Math.cos(arrowTailAngle), arrowTail.y + arrowHalfWidth * Math.sin(arrowTailAngle));
                this.d3Context.lineTo(arrowTailVertex.x, arrowTailVertex.y);
                this.d3Context.lineTo(arrowTail.x - arrowHalfWidth * Math.cos(arrowTailAngle), arrowTail.y - arrowHalfWidth * Math.sin(arrowTailAngle));

                this.d3Context.fillStyle = arrowColor;
                this.d3Context.fill();
            })
        },
        drawNode(node, nodeRadius) {
            this.d3Context.strokeStyle = "#fff";
            this.d3Context.beginPath();
            this.d3Context.lineWidth = 1;
            this.d3Context.moveTo(node.x + nodeRadius, node.y);
            this.d3Context.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);

            this.d3Context.fillStyle = this.colorNode(node);
            this.d3Context.fill();

            const nodeIsSelectedSourceSubreddit = node.id == this.selectedSourceSubreddit
            const nodeIsSelectedTargetSubreddit = node.id == this.selectedTargetSubreddit
            const nodeIsSelectedNode = node.id == (this.selectedNode && this.selectedNode.id)


            if (nodeIsSelectedSourceSubreddit) {
                this.drawNodeName(node, offset = 12)
            } else if (nodeIsSelectedTargetSubreddit) {
                this.drawNodeName(node, offset = 12)
            } else if (this.showSubredditNames) {
                this.drawNodeName(node)
            } else if (nodeIsSelectedNode) {
                this.drawNodeName(node)
            }

            if (node.type == "parent") {
                this.drawParentNode(node)
            }
            if (node.type == "child") {
                this.drawChildNode(node)
            }
        },
        drawParentNode(node) {
            this.d3Context.lineWidth = 1;
            if (node.collapsed) {
                this.d3Context.strokeStyle = "#263238";
            } else {
                this.d3Context.strokeStyle = "#0dcaf0";
            }
            this.d3Context.stroke();
        },
        drawChildNode(node) {
            this.d3Context.beginPath();
            this.d3Context.lineWidth = 1;
            this.d3Context.moveTo(node.x + this.d3NodeRadius, node.y);
            this.d3Context.arc(node.x, node.y, this.d3NodeRadius / 2, 0, 2 * Math.PI);
            this.d3Context.fillStyle = "white"
            this.d3Context.fill();
            if (node.collapsed) {
                this.d3Context.strokeStyle = "#016b81";
            } else {
                this.d3Context.strokeStyle = "#0dcaf0";
            }
        },
        drawNodeName(node, offset = 8) {
            this.d3Context.font = "5px Verdana";
            this.d3Context.fillText(node.id, node.x + offset, node.y);
            // this.d3Context.fillText(`id: ${node.id} g: ${node.group} t: ${node.type} c: ${node.collapsed}`, node.x + offset, node.y);
        },
        getNodeById(id) { // id = subreddit
            return this.nodes.filter(node => node.id == id)[0]
        },
        panToNode(nodeId) {
            const selectedNode = this.getNodeById(nodeId)
            const x = selectedNode.x
            const y = selectedNode.y
            const zoomLevel = 2
            const transform = d3.zoomIdentity.translate(this.width / 2, this.height / 2).scale(zoomLevel).translate(-x, -y)
            this.d3Transform = transform
            d3.select(this.d3Canvas).call(d3.zoom().transform, transform)
            this.simulationUpdate()
        },
        drawSelectedSubreddits() {
            const drawSelection = (node, color) => {
                this.d3Context.beginPath();
                this.drawNode(node, this.d3NodeRadius * 2)
                this.d3Context.fill();
                this.d3Context.strokeStyle = color;
                this.d3Context.lineWidth = .7;
                this.d3Context.stroke();
            }
            if (this.selectedSourceSubreddit) {
                const node = this.getNodeById(this.selectedSourceSubreddit)
                if (node) {
                    drawSelection(node, "#03a9f4")
                }
            }
            if (this.selectedTargetSubreddit) {
                const node = this.getNodeById(this.selectedTargetSubreddit)
                if (node) {
                    drawSelection(node, "#ff9800")
                }
            }
        },
        drawSelectedNode() {
            if (this.selectedNode) {
                const node = this.getNodeById(this.selectedNode.id)
                if (node) {
                    this.d3Context.beginPath();
                    this.drawNode(node, this.d3NodeRadius)
                    this.d3Context.fill();
                    this.d3Context.strokeStyle = "orange";
                    this.d3Context.lineWidth = 1;
                    this.d3Context.stroke();
                }   
            }
        },
        handleNodeClick(node) {
            if (node.type == 'parent' && this.selectedNode && this.selectedNode.id == node.id) {
                this.handleSecondNodeClick(node)
            }
            this.selectedNode = node
            this.$emit("node-selected", node)
            return this.getNodeById(node.id)
        },
        handleSecondNodeClick(node) {
            this.toggleCollapseChildren(node.group)
            this.loadDataIntoSimulation()
        },
        handleCanvasClick() {
            this.selectedNode = null
        },
        dragSubject(event) {
            const x = this.d3Transform.invertX(event.x);
            const y = this.d3Transform.invertY(event.y);
            let node = this.findNode(this.nodes, x, y);

            const clickedOnInvisibleNode = node && (node.type == "child" && node.collapsed)
            if (clickedOnInvisibleNode) {
                return // Return nothing to allow panning on invisible node click
            }

            if (node) {
                node = this.handleNodeClick(node)
                node.x = this.d3Transform.applyX(node.x);
                node.y = this.d3Transform.applyY(node.y);
            } else {
                this.handleCanvasClick()
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
        findNode(nodes, x, y) {
            const rSq = this.d3NodeRadius * this.d3NodeRadius;
            for (node of nodes) {
                const dx = x - node.x
                const dy = y - node.y
                const distSq = (dx * dx) + (dy * dy)
                if (distSq < rSq) {
                    return node;
                }
            }
            // No node selected
            return undefined;
        },
        expandNode(newNodeId, oldNodeId) {
            const node = this.getNodeById(newNodeId)
            if (node) { // Expand the new node
                this.mutateNode(node.id, {...node, "collapsed": false})
            }
            if (this.collapseAll) { // Collapse the old node
                const node = this.getNodeById(oldNodeId)
                if (node) {
                    this.mutateNode(node.id, {...node, "collapsed": true})
                }
            }
        },
        toggleCollapseChildren(group) {
            for (node of this.nodes) {
                const belongsToGroup = node.group == group
                if (belongsToGroup) {
                    const mutatedNode = {...node, "collapsed": !node.collapsed}
                    this.mutateNode(node.id, mutatedNode)
                }
            }
        },
        toggleCollapseAllChildren() {
            this.nodes.forEach(x => x.collapsed = this.collapseAll)
            this.loadDataIntoSimulation()
        },

        setDimensionsOfCanvas(withUpdate=true) {
            var containerDimensions = document.getElementById('graph-network-container').getBoundingClientRect();
            this.d3Canvas.width = containerDimensions.width; // The width of the parent div of the canvas
            this.d3Canvas.height = window.innerHeight / 1.8; // A fraction of the height of the screen
            if (withUpdate) {
                this.simulationUpdate()
            }
        },
        burstSimulation(alpha=1) {
            this.d3Simulation.alpha(alpha)
            this.d3Simulation.restart()
        },
        addNode(node) {
            this.nodes.push(node)
            this.loadDataIntoSimulation()
        },
        deleteNode(id) {
            this.nodes = this.nodes.filter(node => node.id != id)
            this.links = this.links.filter(node => node.source.id != id)
            this.links = this.links.filter(node => node.target.id != id)
            this.loadDataIntoSimulation()
        },
        mutateNode(idOfNodeToMutate, newNode) {
            const indexOfNode = this.nodes.findIndex(x => x.id == idOfNodeToMutate)
            
            // Mutate this.nodes
            this.$set(this.nodes, indexOfNode, newNode)

            // Mutate this.links
            this.links.forEach((link, index) => {
                if (link.source.id == idOfNodeToMutate) {
                    this.$set(this.links, index, { ...this.links[index], source: newNode})
                } else if (link.target.id == idOfNodeToMutate) {
                    this.$set(this.links, index, { ...this.links[index], target: newNode})
                }
            })
            return newNode
        },
        getLinksFor(nodeId) {
            return this.links.filter(link => (link.source.id == nodeId) || (link.target.id == nodeId))
        },
        // Should be called whenever this.nodes and this.links changes.
        loadDataIntoSimulation() {
            const dataHasBeenInitializedIntoSimulation = typeof(this.links[0].source) == "object"
            if (!dataHasBeenInitializedIntoSimulation) {
                // Initialize data into simulation
                this.d3Simulation.nodes(this.nodes).force("link").links(this.links)
            }
            const linksToDraw = this.getLinksToDraw
            const nodesToDraw = this.getNodesToDraw

            this.d3Simulation.nodes(nodesToDraw).force("link").links(linksToDraw)
            this.burstSimulation(0.1)
        },
        handleNetworkDataChange() {
            this.setDataFromNetworkData()
            this.expandNode(this.selectedSourceSubreddit) // Expand in the case that the node is a child node
            this.expandNode(this.selectedTargetSubreddit) // Expand in the case that the node is a child node
        },
        handleNodesChange() {
            this.loadDataIntoSimulation()
            this.burstSimulation()
        },
        resetForceData() {
            Object.assign(this.$data, { ...this.$data, ...d3ForceInitialState() })
        },
        setForceSimulation() {
            // Overwrite the current simulation values with whatever is in Vue's data
            this.d3Simulation.force("link", d3.forceLink()
                .id(d => d.id)
                .distance(this.d3ForceLinkDistance)
            )
            this.d3Simulation.force("charge", d3.forceManyBody()
                .strength(this.d3ForceChargeStrength)
                .theta(this.d3ForceChargeTheta)
                .distanceMin(this.d3ForceChargeDistanceMin)
                .distanceMax(this.d3ForceChargeDistanceMax)
            )
            this.d3Simulation.force("center", d3.forceCenter(this.width / 2, this.height / 2)
                .strength(this.d3ForceCenterStrength)
            )
            this.loadDataIntoSimulation()
            this.burstSimulation()
        },
        initForceSimulation() {
            this.d3Simulation = d3.forceSimulation()
            this.setForceSimulation()
        },
        showFpsCounter() {
            var stats = new Stats();
            stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild(stats.dom);

            function animate() {
                stats.begin();
                // monitored code goes here
                stats.end();
                requestAnimationFrame(animate);
            }
            requestAnimationFrame(animate);
        },
        setDataFromNetworkData() {
            // Transform the rows from being arrays of values to objects.
            this.links = this.networkData.links.map(d => ({ source: d[0], target: d[1], value: d[2] }))
            this.nodes = this.networkData.nodes.map(d => ({ id: d[0], type: d[1], group: d[2], collapsed: this.collapseAll}))
        },
        init() {
            this.setDataFromNetworkData()

            // Set the canvas and the context to the Vue component's data
            this.d3Canvas = d3.select("#graph-network-container")
                .append('canvas')
                .attr("class", "shadow-sm rounded border")
                .attr("style", "width: 100%")
                .node()
            this.d3Context = this.d3Canvas.getContext("2d")

            this.setDimensionsOfCanvas(withUpdate=false)

            // Performance optimizations
            this.d3Context.imageSmoothingEnabled = false
            this.d3Context.translate(0.5, 0.5)
            this.d3Context.alpha = false
            
            // Force simulation
            this.initForceSimulation()

            this.setBackgroundColor()

            this.d3Transform = d3.zoomIdentity

            // Initialize node drag and zoom & pan behavior
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
                .on("dblclick.zoom", null);

            this.d3Simulation.on("tick", this.simulationUpdate);

            this.loadDataIntoSimulation()
        }
    },
    created() {
        window.addEventListener("resize", this.setDimensionsOfCanvas);
    },
    mounted() {
        this.init()
    },
    destroyed() {
        window.removeEventListener("resize", this.setDimensionsOfCanvas);
    },
    template: `
    <div>
        <div class="row">
            <div class="col-md-2">
                <p><strong>Force controls</strong></p>
                <div class="row">
                    <div class="col">
                        <button title="Reset force controls" class="btn btn-primary btn-sm mb-2" @click="resetForceData" @click.middle="showFpsCounter"><i class="bi bi-sliders"></i></button><br/>
                    </div>
                    <div class="col text-end">
                        <button title="Reload network" class="btn btn-primary btn-sm mb-2" @click="handleNetworkDataChange"><i class="bi bi-tropical-storm"></i></button><br/>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="flexSwitchCheckChecked" checked v-model="collapseAll">
                            <label class="form-check-label" for="flexSwitchCheckChecked">Collapse all clusters</label>
                        </div>
                    </div>
                </div>
                <label for="customRange1" class="form-label">Force strength</label>: <strong>{{ d3ForceChargeStrength }}</strong>
                <input type="range" class="form-range" min="-100" max="10" step="1" id="customRange1" v-model="d3ForceChargeStrength">

                <label for="customRange2" class="form-label">Theta</label>: <strong>{{ d3ForceChargeTheta }}</strong>
                <input type="range" class="form-range" min="-5" max="5" step=".1" id="customRange2" v-model="d3ForceChargeTheta">

                <label for="customRange2" class="form-label">Min force distance</label>: <strong>{{ d3ForceChargeDistanceMin }}</strong>
                <input type="range" class="form-range" min="-5" max="30" step=".1" id="customRange2" v-model="d3ForceChargeDistanceMin">

                <label for="customRange2" class="form-label">Max force distance</label>: <strong>{{ d3ForceChargeDistanceMax }}</strong>
                <input type="range" class="form-range" min="-5" max="3000" step="10" id="customRange2" v-model="d3ForceChargeDistanceMax">

                <label for="customRange2" class="form-label">Link distance</label>: <strong>{{ d3ForceLinkDistance }}</strong>
                <input type="range" class="form-range" min=1 max="500" step="1" id="customRange2" v-model="d3ForceLinkDistance">

                <label for="customRange2" class="form-label">Center Strength</label>: <strong>{{ d3ForceCenterStrength }}</strong>
                <input type="range" class="form-range" min="0" max="2" step=".01" id="customRange2" v-model="d3ForceCenterStrength">

            </div>
            <div class="col">
                <div id="graph-network-container">
                </div>
            </div>
        </div>
    </div>
    `
})
