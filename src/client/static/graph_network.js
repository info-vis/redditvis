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
            d3NodeRadius: 5,
            d3LinkWidth: 1,
        }
    },
    computed: {
        width: function() { return this.d3Canvas && this.d3Canvas.width || null },
        height: function() { return this.d3Canvas && this.d3Canvas.height || null }
    },
    props: {
        networkData: Object,
        selectedSourceSubreddit: String,
        selectedTargetSubreddit: String,
        showSubredditNames: Boolean, // Show a name label next to each node
    },
    watch: {
        showSubredditNames: "simulationUpdate",
        selectedSourceSubreddit: "simulationUpdate",
        selectedTargetSubreddit: "simulationUpdate",
        networkData: "init"
    },
    methods: {
        setBackgroundColor(color = "white") {
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
            this.drawArrows(this.links)
            
            this.nodes.forEach(node => this.drawNode(node, this.d3NodeRadius))

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
            const getColor = () => "gray";
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

            if (nodeIsSelectedSourceSubreddit) {
                this.drawNodeName(node, offset = 12)
            } else if (nodeIsSelectedTargetSubreddit) {
                this.drawNodeName(node, offset = 12)
            } else if (this.showSubredditNames) {
                this.drawNodeName(node)
            }
        },
        drawNodeName(node, offset = 8) {
            this.d3Context.font = "5px Verdana";
            this.d3Context.fillText(node.id, node.x + offset, node.y);
        },
        findNodeById(id) {
            return this.nodes.filter(node => node.id == id)[0]
        },
        panToSubreddit(subredditName) {
            const selectedNode = this.findNodeById(subredditName)
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
                const node = this.findNodeById(this.selectedSourceSubreddit)
                if (node) {
                    drawSelection(node, "#03a9f4")
                }
            }
            if (this.selectedTargetSubreddit) {
                const node = this.findNodeById(this.selectedTargetSubreddit)
                if (node) {
                    drawSelection(node, "#ff9800")
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

            // Performance optimizations
            this.d3Context.imageSmoothingEnabled = false
            this.d3Context.translate(0.5, 0.5)

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
