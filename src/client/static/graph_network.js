// Define a new component called graph-network
Vue.component('graph-network', {
    data: function () {
        return {
            data: {}, // This contains the nodes and links
            numberOfNodes: 500,
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
    created: async function() {
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
      
        const canvas = document.getElementById("graph-network-canvas")
        const context = canvas.getContext("2d")

        function setBackgroundColor(color="black") {
            context.fillStyle = color;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        const clearCanvas = () => context.clearRect(0, 0, width, height);

        setBackgroundColor()
        
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));

        // d3-scale, used for coloring nodes
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        color = d => scale(d.group);

        function ticked() {
            clearCanvas()
            setBackgroundColor()

            context.beginPath();
            links.forEach(drawLink);
            context.strokeStyle = "#aaa";
            context.stroke();
            
            context.strokeStyle = "#fff";
            for (const node of nodes) {
                context.beginPath();
                context.lineWidth = 1;
                drawNode(node) 
                context.fillStyle = color(node);
                context.fill();
                context.stroke();
            }
        }

        function drawLink(d) {
            context.moveTo(d.source.x, d.source.y);
            context.lineTo(d.target.x, d.target.y);
            context.lineWidth = d.value/15;
        }
    
        function drawNode(d) {
            const centerX = d.x
            const centerY = d.y
            const startAngle = 0
            const endAngle = 2 * Math.PI
            const foo = 5
            context.moveTo(centerX + foo, centerY);
            context.arc(centerX, centerY, foo, startAngle, endAngle);
        }

        simulation.on("tick", ticked);

        drag = simulation => {
            function dragsubject(event) {
                return simulation.find(event.x, event.y);
            }
          
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            
            function dragged(event) {
                context.fillRect(event.x,event.y,25,25)
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            
            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
            
            return d3.drag()
                .subject(dragsubject)
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        d3.select(context.canvas).call(drag(simulation)).node();

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

