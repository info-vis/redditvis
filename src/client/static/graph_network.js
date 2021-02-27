// Define a new component called graph-network
Vue.component('graph-network', {
    data: function () {
        return {
            data: {}, // This contains the nodes and links
            numberOfNodes: 2000,
            isLoading: true, // When the data is loading, this will be true
            height: 500, // of the canvas
            width: 965 // of the canvas
        }   
    },
    methods: {
        /**
         * Fetch data and set this.data.
         */
        fetchData: async function() {
            const response = await fetch(`${apiEndpoint}network?n=${this.numberOfNodes}`);
            const data = await response.json();
            this.data = await data
        }
    },
    mounted: async function() {
        const width = this.width
        const height = this.height

        const w2 = width / 2,
            h2 = height / 2,
            nodeRadius = 5;
            
        await this.fetchData()
        this.isLoading = false
  
        // Transform the rows from being arrays of values to objects.
        const links = this.data.links.map(d => ({source: d[0], target: d[1], value: d[2]}))
        const nodes = this.data.nodes.map(d => ({id: d, group: Math.floor(Math.random() * Math.floor(10))}))
      
        const r = 1.5 // Used for the zoom
        const canvas = document.getElementById("graph-network-canvas")
        const context = canvas.getContext("2d")

        // d3.select(context.canvas).call(drag(simulation)).node();
        d3.select(context.canvas)
            .call(d3.zoom()
                .scaleExtent([0.1, 6])
                .on("zoom", zoomed))
            .on("wheel", event => event.preventDefault());

        setBackgroundColor()
        
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));

        simulation.on("tick", simulationUpdate);

        let transform = d3.zoomIdentity;

        function simulationUpdate() {
            context.save();
            clearCanvas()
            setBackgroundColor()
            context.translate(transform.x, transform.y);
            context.scale(transform.k, transform.k);
            drawLinks(links)
            for (const node of nodes) {
                drawNode(node) 
            }
            // context.fill();
            context.restore();
        }

        function zoomed(event, d) {
            transform = event.transform
            simulationUpdate()
        }

        const scale = d3.scaleOrdinal(d3.schemeCategory10);

        function color(d) {
            return scale(d.group)
        }

        function clearCanvas () {
            context.clearRect(0, 0, width, height);
        }

        function setBackgroundColor(color="black") {
            context.fillStyle = color;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        function drawLinks(links) {
            context.beginPath();
            links.forEach(link => {
                context.moveTo(link.source.x, link.source.y);
                context.lineTo(link.target.x, link.target.y);
                context.lineWidth = link.value/15;
            })
            context.strokeStyle = "#aaa";
            context.stroke();
        }
    
        function drawNode(node) {
            context.strokeStyle = "#fff";
            context.beginPath();
            context.lineWidth = 1;
            const radius = 5
            context.moveTo(node.x + radius, node.y);
            context.arc(node.x, node.y, radius, 0, 2 * Math.PI);

            context.fillStyle = color(node);
            context.fill();
            context.stroke();
        }


        // drag = simulation => {
        //     function dragsubject(event) {
        //         const transform = d3.zoomTransform(canvas)
        //         let subject = null
        //         let distance = 5
        //         const x = transform.invertX(event.x)
        //         const y = transform.invertY(event.y)
        //         for (const node of nodes) {
        //             let d = Math.hypot(x - node.x, y - node.y)
        //             if (d < distance) {
        //                 distance = d
        //                 subject = node
        //             }
        //         }
        //         return subject ? simulation.find(event.x, event.y) : null
        //     }
          
        //     function dragstarted(event) {
        //         console.log(event)
        //         if (!event.active) simulation.alphaTarget(0.3).restart();
        //         event.subject.fx = event.subject.x;
        //         event.subject.fy = event.subject.y;
        //     }
            
        //     function dragged(event) {
        //         context.fillRect(event.x,event.y,25,25)
        //         event.subject.fx = event.x;
        //         event.subject.fy = event.y;
        //     }
            
        //     function dragended(event) {
        //         if (!event.active) simulation.alphaTarget(0);
        //         event.subject.fx = null;
        //         event.subject.fy = null;
        //     }
            
        //     return d3.drag()
        //         .subject(dragsubject)
        //         .on("start", dragstarted)
        //         .on("drag", dragged)
        //         .on("end", dragended);
        // }

        // // d3.select(context.canvas).call(drag(simulation)).node();
        // d3.select(context.canvas)
        //     .call(d3.zoom()
        //         .scaleExtent([0.1, 6])
        //         .on("zoom", ({transform}) => zoomed(transform)))
        //     .on("wheel", event => event.preventDefault());
        
        // zoomed(d3.zoomIdentity);
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
                <canvas class="shadow-sm rounded border" id="graph-network-canvas" v-bind:style="{width: width, height: height}" :width="this.width + 'px'" :height="this.height + 'px'">
                </canvas>
            </div>
        </div>
    `
  })

