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
            d3LinkWidth: 1,
            ...d3ForceInitialState(),
            selectedNodeId: null,
            highlightedNodeIds: [],
            nodesDictionary: {}, // Used to store the index of each node in this.nodes
            colors: {
                backgroundColor: "white",
                highlightColor: "#0e6efdc2",
                // nodeColor: "#408acf",
                nodeColor: "#90a4ae",
                nodeBorderColor: "#c1d5e0",
                selectedColor: "#e5d163",
                parentExpanded: "#0dcaf0",
                childNode: "white",
                linkColor: "#48484826",
                arrowColor: "#bdbdbd"
                // arrowColor: "black"
            },
            baseRadius: 3
        }
    },
    computed: {
        getNodesToDraw() {
            return this.nodes.filter(node => (!node.collapsed || node.type != "child"))
        },
        getLinksToDraw() {
            const highlightedNodeIds = this.getNodesToDraw.map(x => x.id)
            return this.links.filter(link => (
                highlightedNodeIds.includes(link.source.id) && highlightedNodeIds.includes(link.target.id)
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
            this.handleSelectedSubreddit(newSubreddit, oldSubreddit)
        },
        selectedTargetSubreddit: function (newSubreddit, oldSubreddit) {
            this.handleSelectedSubreddit(newSubreddit, oldSubreddit)
        },
        networkData: "handleNetworkDataChange",
        nodes: function () {
            this.loadDataIntoSimulation()
            this.burstSimulation()
        },
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
        collapseAll: "toggleCollapseAllChildren",
        selectedNodeId: function (newNodeId, oldNodeId) {
            if (this.selectedNodeId) {
                this.$emit("node-selected", this.selectedNodeId)
                this.highlightSelectedNodeLinks()
            }
            if (oldNodeId) {
                const oldNode = this.getNodeById(oldNodeId)
                if (oldNode) {
                    oldNode.fx = null
                    oldNode.fy = null
                }
            }
        },
    },
    methods: {
        afterSimulationIsReady() {
            this.generateDictionary()
            this.highlightSelectedNodeLinks()
            if (this.selectedNodeId) {
                this.panToCenter()
            }
        },
        setBackgroundColor(color = this.colors.backgroundColor) {
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
            this.drawNodes()

            this.d3Context.restore();
        },
        zoomed(event) {
            this.d3Transform = event.transform
            this.simulationUpdate()
        },
        getNodeColor(d) {
            return this.d3Scale(d.group)
        },
        clearCanvas() {
            this.d3Context.clearRect(0, 0, this.d3Canvas.width, this.d3Canvas.height);
        },
        drawLinks(links) {
            // const getColor = (d) => d.highlight ? this.highlightColor : "#0000001a";
            const getColor = (d) => d.highlight ? this.colors.highlightColor : this.colors.linkColor;
            const getWidth = (d) => d.normalizedCount
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
                const arrowColor = this.colors.arrowColor;
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
        drawNodes() {
            const nodesToDraw = this.getNodesToDraw
            nodesToDraw.forEach(node => this.drawNode(node))
            this.drawSelectedNode()
            this.drawSelectedSubreddits()
        },
        drawNode(node) {
            const radius = this.getNodeRadius(node)

            if (node.type == "parent") {
                this.drawParentNode(node, radius)
            } else if (node.type == "child") {
                this.drawChildNode(node, radius)
            } else {
                this.drawRegularNode(node, radius)
            }

            if (node.highlight == true) {
                this.drawHighlightedNode(node, radius)
            }

            if (this.shouldDrawNodeName(node)) {
                this.drawNodeName(node, radius)
            } 
        },
        shouldDrawNodeName(node) {
            const nodeIsSelectedSourceSubreddit = node.id == this.selectedSourceSubreddit
            const nodeIsSelectedTargetSubreddit = node.id == this.selectedTargetSubreddit
            const nodeIsSelectedNode = node.id == (this.selectedNodeId)
            const nodeIsHighlighted = node.highlight
            if (this.showSubredditNames
                || nodeIsSelectedSourceSubreddit 
                || nodeIsSelectedTargetSubreddit 
                || nodeIsSelectedNode
                || nodeIsHighlighted) {
                return true
            }
            return false
        },
        drawRegularNode(node, radius) {
            // Node fill
            this.d3Context.beginPath();
            this.d3Context.moveTo(node.x + radius, node.y);
            this.d3Context.arc(node.x, node.y, radius, 0, 2 * Math.PI);
            this.d3Context.fillStyle = this.colors.nodeColor;
            this.d3Context.fill();

            // Node outline
            this.d3Context.strokeStyle = this.colors.nodeBorderColor;
            this.d3Context.lineWidth = 2;
            this.d3Context.stroke()
        },
        drawHighlightedNode(node, radius) {
            const highlightRadius = radius + 1
            this.d3Context.beginPath();
            this.d3Context.moveTo(node.x + highlightRadius, node.y);
            this.d3Context.arc(node.x, node.y, highlightRadius, 0, 2 * Math.PI);

            this.d3Context.lineWidth = 2;
            this.d3Context.strokeStyle = this.colors.highlightColor;
            this.d3Context.stroke();
        },
        drawParentNode(node, radius) {
            const smallRadius = Math.max(radius * 0.7)

            if (node.collapsed) {
                // Node fill
                this.d3Context.beginPath();
                this.d3Context.moveTo(node.x + radius, node.y);
                this.d3Context.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                this.d3Context.fillStyle = "white";
                this.d3Context.fill();
                // Inner node fill
                this.d3Context.beginPath();
                this.d3Context.moveTo(node.x + smallRadius, node.y);
                this.d3Context.arc(node.x, node.y, smallRadius, 0, 2 * Math.PI);
                this.d3Context.fillStyle = this.getNodeColor(node);
                this.d3Context.fill();
            } else { // node is expanded
                // Node fill
                this.d3Context.beginPath();
                this.d3Context.moveTo(node.x + radius, node.y);
                this.d3Context.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                this.d3Context.fillStyle = this.getNodeColor(node);;
                this.d3Context.fill();
                // Inner node fill
                this.d3Context.beginPath();
                this.d3Context.moveTo(node.x + smallRadius, node.y);
                this.d3Context.arc(node.x, node.y, smallRadius, 0, 2 * Math.PI);
                this.d3Context.fillStyle = "white"
                this.d3Context.fill();
            }
            // Node outline
            this.d3Context.beginPath();
            this.d3Context.moveTo(node.x + radius, node.y);
            this.d3Context.arc(node.x, node.y, radius, 0, 2 * Math.PI);
            this.d3Context.lineWidth = 2;
            this.d3Context.strokeStyle = this.getNodeColor(node);
            this.d3Context.stroke();
        },
        drawChildNode(node, radius) {
            // Node fill
            this.d3Context.beginPath();
            this.d3Context.moveTo(node.x + radius, node.y);
            this.d3Context.arc(node.x, node.y, radius, 0, 2 * Math.PI);
            this.d3Context.fillStyle = this.colors.childNode
            this.d3Context.fill();

            // Node outline
            this.d3Context.lineWidth = 2;
            this.d3Context.strokeStyle = this.getNodeColor(node);
            this.d3Context.stroke()
        },
        drawNodeName(node, radius) {
            this.d3Context.font = "6px Verdana";
            this.d3Context.lineJoin = "round";
            // Outline
            this.d3Context.strokeStyle = 'black';
            this.d3Context.lineWidth = 1;
            this.d3Context.strokeText(node.id, node.x + radius + 2, node.y);
            // Fill
            this.d3Context.fillStyle = 'white';
            this.d3Context.fillText(node.id, node.x + radius + 2, node.y);
        },
        drawSelectedSubreddits() {
            const drawSelection = (node, color) => {
                this.d3Context.beginPath();
                this.drawNode(node)
                this.d3Context.fillStyle = color
                this.d3Context.fill();
                this.d3Context.strokeStyle = color;
                this.d3Context.lineWidth = 1;
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
            if (this.selectedNodeId) {
                const node = this.getNodeById(this.selectedNodeId)
                if (node) {
                    // this.d3Context.beginPath();
                    // this.drawNode(node)
                    // this.d3Context.fillStyle = "green"
                    // this.d3Context.fill();
                    // this.d3Context.strokeStyle = this.colors.selectedColor;
                    // this.d3Context.lineWidth = 2;
                    // this.d3Context.stroke();

                    // Node outline
                    const radius = this.getNodeRadius(node)
                    this.d3Context.beginPath();
                    this.d3Context.moveTo(node.x + radius, node.y);
                    this.d3Context.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                    this.d3Context.lineWidth = 2;
                    this.d3Context.strokeStyle = this.colors.selectedColor;
                    this.d3Context.stroke();
                }
            }
        },
        /**
         * Retrieve the node in this.nodes by doing a lookup in the 
         * node dictionary.
         */
        getNodeById(nodeId) { // nodeId = subreddit
            const index = this.nodesDictionary[nodeId]
            return this.nodes[index]
        },
        panToNode(nodeId) {
            const selectedNode = this.getNodeById(nodeId)
            const x = selectedNode.x
            const y = selectedNode.y
            const zoomLevel = 2
            const transform = d3.zoomIdentity.translate(this.d3Canvas.width / 2, this.d3Canvas.height / 2).scale(zoomLevel).translate(-x, -y)
            this.d3Transform = transform
            d3.select(this.d3Canvas).call(d3.zoom().transform, transform)
            this.simulationUpdate()
        },
        panToCenter() {
            const selectedNode = this.getNodeById(this.selectedNodeId)
            const zoomLevel = 1
            const transform = d3.zoomIdentity.translate(this.d3Canvas.width / 2, this.d3Canvas.height / 2).scale(zoomLevel).translate(-(this.d3Canvas.width / 2), -(this.d3Canvas.height / 2))
            this.d3Transform = transform
            d3.select(this.d3Canvas).call(d3.zoom().transform, transform)
            this.simulationUpdate()
        },
        handleNodeClick(node) {
            if (node.type == 'parent' && this.selectedNodeId == node.id) {
                this.handleSecondNodeClick(node)
            }
            this.selectedNodeId = node.id
            return this.getNodeById(node.id)
        },
        handleSecondNodeClick(node) {
            this.toggleCollapseChildren(node.group)
            this.loadDataIntoSimulation()
        },
        handleCanvasClick() {
            this.unhighlightAllLinks()
            this.setAttributesOnNodes(this.highlightedNodeIds, { highlight: false, drawName: false })
            this.highlightedNodeIds = []
            this.selectedNodeId = null
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
            // Fixate
            event.subject.fx = event.subject.x
            event.subject.fy = event.subject.y
        },
        findNode(nodes, x, y) {
            for (node of nodes) {
                const radius = this.getNodeRadius(node)
                const radiusSquared = radius * radius
                const distanceX = x - node.x
                const distanceY = y - node.y
                const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY)
                if (distanceSquared < radiusSquared) {
                    return node;
                }
            }
            // No node selected
            return undefined;
        },
        expandNode(newNodeId, oldNodeId) {
            const node = this.getNodeById(newNodeId)
            if (node) { // Expand the new node
                this.mutateNode(node.id, { ...node, "collapsed": false })
            }
            if (this.collapseAll) { // Collapse the old node
                const node = this.getNodeById(oldNodeId)
                if (node) {
                    this.mutateNode(node.id, { ...node, "collapsed": true })
                }
            }
        },
        toggleCollapseChildren(group) {
            for (node of this.nodes) {
                const belongsToGroup = node.group == group
                if (belongsToGroup) {
                    const mutatedNode = { ...node, "collapsed": !node.collapsed }
                    this.mutateNode(node.id, mutatedNode)
                }
            }
        },
        toggleCollapseAllChildren() {
            this.nodes.forEach(x => x.collapsed = this.collapseAll)
            this.loadDataIntoSimulation()
        },
        setDimensionsOfCanvas(withUpdate = true) {
            var containerDimensions = document.getElementById('graph-network-container').getBoundingClientRect();
            this.d3Canvas.width = containerDimensions.width; // The width of the parent div of the canvas
            this.d3Canvas.height = window.innerHeight / 1.8; // A fraction of the height of the screen
            if (withUpdate) {
                this.simulationUpdate()
            }
        },
        burstSimulation(alpha = 1) {
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
        /**
         * @param {String} idOfNodeToMutate 
         * @param {node} newNode Ensure that this is not a clone, but a reference to the node in this.nodes, 
         *  since D3 might mutate the node before you mutate, resulting in a stale node.
         */
        mutateNode(idOfNodeToMutate, newNode) {
            const indexOfNode = this.nodes.findIndex(x => x.id == idOfNodeToMutate)

            // Mutate this.nodes
            this.$set(this.nodes, indexOfNode, newNode)

            // Mutate this.links
            this.links.forEach((link, index) => {
                if (link.source.id == idOfNodeToMutate) {
                    this.$set(this.links, index, { ...this.links[index], source: newNode })
                } else if (link.target.id == idOfNodeToMutate) {
                    this.$set(this.links, index, { ...this.links[index], target: newNode })
                }
            })
        },
        unhighlightAllLinks() {
            this.links = this.links.map(link => ({ ...link, highlight: false }))
        },
        setAttributesOnNodes(nodeIds, attributes) {
            nodeIds.forEach((nodeId) => {
                const node = this.getNodeById(nodeId)
                if (node) {
                    // node = {...node,  ...attributes}
                    for (const [key, value] of Object.entries(attributes)) {
                        node[key] = value
                    }
                    this.mutateNode(nodeId, node)
                }
            })
        },
        highlightSelectedNodeLinks() {
            this.unhighlightAllLinks()
            const nodeId = this.selectedNodeId
            let nodeIds = []
            this.links = this.links.map(link => {
                if ((link.source.id == nodeId) || (link.target.id == nodeId)) {
                    nodeIds.push(link.source.id)
                    nodeIds.push(link.target.id)
                    link.highlight = true
                    return link
                }
                return link
            })
            nodeIds = [...new Set(nodeIds)]
            this.setAttributesOnNodes(this.highlightedNodeIds, { highlight: false, drawName: false })
            this.highlightedNodeIds = nodeIds
            this.setAttributesOnNodes(nodeIds, { highlight: true, drawName: true })
        },
        // Should be called whenever this.nodes and this.links changes.
        loadDataIntoSimulation() {
            const dataHasBeenInitializedIntoSimulation = typeof (this.links[0].source) == "object"
            if (!dataHasBeenInitializedIntoSimulation) {
                // Initialize data into simulation
                this.d3Simulation.nodes(this.nodes).force("link").links(this.links)
                this.afterSimulationIsReady()
            }
            const linksToDraw = this.getLinksToDraw
            const nodesToDraw = this.getNodesToDraw

            this.d3Simulation.nodes(nodesToDraw).force("link").links(linksToDraw)
            this.burstSimulation(0.1)
        },
        /**
         * Dictionary for node lookup. Ensures lookup in this.nodes by node id is fast and does not
         * require a loop through the entire list of this.nodes each time.
         * 
         * See this.getNodeById(nodeId) for the lookup function.
         * 
         * Key: node.id
         * Value: index in this.nodes
         */
        generateDictionary() {
            this.nodesDictionary = {}
            this.nodes.forEach((node, index) => {
                this.nodesDictionary[node.id] = index
            })
        },
        handleSelectedSubreddit(newSubreddit, oldSubreddit) {
            this.expandNode(newSubreddit, oldSubreddit)
            this.selectedNodeId = newSubreddit
            this.simulationUpdate()
        },
        handleNetworkDataChange() {
            this.setDataFromNetworkData()
            this.expandNode(this.selectedSourceSubreddit) // Expand in the case that the node is a child node
            this.expandNode(this.selectedTargetSubreddit) // Expand in the case that the node is a child node
        },
        resetForceData() {
            Object.assign(this.$data, { ...this.$data, ...d3ForceInitialState() })
        },
        getNodeRadius(node) {
            return node.normalizedPostCount + this.baseRadius
        },
        setForceSimulation() {
            // Overwrite the current simulation values with whatever is in Vue's data
            this.d3Simulation.force("link", d3.forceLink()
                .id(node => node.id)
                .distance(this.d3ForceLinkDistance)
            )
            this.d3Simulation.force("charge", d3.forceManyBody()
                .strength(node => this.d3ForceChargeStrength * this.getNodeRadius(node))
                .theta(this.d3ForceChargeTheta)
                .distanceMin(this.d3ForceChargeDistanceMin)
                .distanceMax(this.d3ForceChargeDistanceMax)
            )
            this.d3Simulation.force("center", d3.forceCenter(this.d3Canvas.width / 2, this.d3Canvas.height / 2)
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
            this.links = this.networkData.links.map(d => ({ source: d[0], target: d[1], count: d[2], normalizedCount: d[3] }))
            this.nodes = this.networkData.nodes.map(d => ({
                id: d[0],
                type: d[1],
                group: d[2],
                collapsed: this.collapseAll,
                postCount: d[3],
                normalizedPostCount: parseFloat((Math.log2(d[3]) * 1.3).toFixed(2))
            }))
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

            this.setDimensionsOfCanvas(withUpdate = false)

            // Performance optimizations
            this.d3Context.imageSmoothingEnabled = false
            this.d3Context.translate(0.5, 0.5)
            this.d3Context.alpha = true

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
