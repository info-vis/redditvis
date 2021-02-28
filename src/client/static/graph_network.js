// Define a new component called graph-network
Vue.component('graph-network', {
    data: function () {
        return {
            data: {}, // This contains the nodes and links
            numberOfLinks: 200,
            isLoading: true, // When the data is loading, this will be true
            height: 500, // of the canvas
            width: 965, // of the canvas
            selectedSubreddit: null,
            d3Simulation: null,
            d3Canvas: null,
            d3Context: null,
            d3Transform: d3.zoomIdentity,
            d3Scale: d3.scaleOrdinal(d3.schemeCategory10),
            links: null,
            nodes: null,
            d3NodeRadius: 5
        }   
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
        handleMouseDown(event) {
            console.log("mouse down!")
            var p = d3.pointer(event);
            closestNode = this.d3Simulation.find(p[0], p[1]);
            this.setSelectedSubreddit(closestNode)
            this.drawTooltip(this.selectedSubreddit)
        },
        drawTooltip(node, event) {
            if (!node) {
                return
            }
            this.d3Context.beginPath();
            this.drawNode(node)
            this.d3Context.fill();
            this.d3Context.strokeStyle = "#ff0000";
            this.d3Context.stroke();

            // d3.select('#tooltip')
            //     .style('opacity', 0.8)
            //     // .style('top', event.pageY + 5 + 'px')
            //     // .style('left', event.pageX + 5 + 'px')
            //     .html(`Selected: 
            //     <a class="btn btn-primary" 
            //         target="_blank" 
            //         href="https://www.reddit.com/r/${node.id}/" 
            //         role="button"
            //     >r/${node.id}</a>`);
            this.simulationUpdate();
        },
        setBackgroundColor(color="black") {
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
            // if (this.selectedSubreddit) {
            //     drawTooltip(this.selectedSubreddit)
            // }
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
                this.d3Context.lineWidth = link.value/15;
            })
            this.d3Context.strokeStyle = "#aaa";
            this.d3Context.stroke();
        },
        drawNode(node) {
            this.d3Context.strokeStyle = "#fff";
            this.d3Context.beginPath();
            this.d3Context.lineWidth = 1;
            this.d3Context.moveTo(node.x + this.d3NodeRadius, node.y);
            this.d3Context.arc(node.x, node.y, this.d3NodeRadius, 0, 2 * Math.PI);

            this.d3Context.fillStyle = this.color(node);
            this.d3Context.fill();

            // Node outline
            this.d3Context.strokeStyle = 'black'
            this.d3Context.lineWidth = '1.5'
            this.d3Context.stroke();
        },
        dragSubject(event) {
            const x = this.d3Transform.invertX(event.x);
            const y = this.d3Transform.invertY(event.y);
            const node = this.findNode(this.nodes, x, y, this.d3NodeRadius);
            if (node) {
                node.x =  this.d3Transform.applyX(node.x);
                node.y = this.d3Transform.applyY(node.y);
            }
            // else: No node selected, drag container
            // var p = d3.pointer(event);
            // closeNode = simulation.find(p[0], p[1]);
            // drawTooltip(closeNode)
            
            // simulationUpdate();
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
            // .on("mousedown", this.handleMouseDown)
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
            <div v-if="this.isLoading" class="d-flex justify-content-center">
                <div class="spinner-grow mt-5 text-light" role="status">
                </div>
            </div>
            <p v-if="!this.isLoading" class="m-2">
                Nodes: <span class="badge bg-secondary">{{ this.data.nodes && this.data.nodes.length }}</span><br/>
                Links: <span class="badge bg-secondary">{{ this.data.links && this.data.links.length }}</span>
            </p>
            <div>
                <div id="tooltip" v-if="selectedSubreddit">
                    Selected: 
                    <a class="btn btn-primary" 
                        target="_blank" 
                        href:"https://www.reddit.com/r/{{ selectedSubreddit.id }}/" 
                        role="button"
                    >r/{{ selectedSubreddit.id }}</a>
                    
                </div>
                <canvas class="shadow-sm rounded border" id="graph-network-canvas" v-bind:style="{width: width, height: height}" :width="this.width + 'px'" :height="this.height + 'px'">
                </canvas>
            </div>
        </div>
    `
  })

