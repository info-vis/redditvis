// Define a new component called graph-network
Vue.component('graph-network', {
    data: function () {
        return {
            data: {},
            numberOfNodes: 2000,
            isLoading: true
        }   
    },
    methods: {
        getData: async function() {
            console.log("Getting network data..")
            const response = await fetch(`${apiEndpoint}network?n=${this.numberOfNodes}`);
            const data = await response.json();
            return data
        }
    },
    created: async function() {
        this.data = await this.getData()
        this.isLoading = false

        const height = 600
        const width = 1000
  
        const links = this.data.links.map(d => ({source: d[0], target: d[1], value: d[2]}))
        const nodes = this.data.nodes.map(d => ({id: d, group: Math.floor(Math.random() * Math.floor(10))}))

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody()
                .strength(-30) // -30 = default
                .distanceMax(300)
            )
            .force("center", d3.forceCenter(width / 2, height / 2));

        const drag = simulation => {
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            
            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            
            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
            
            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        const color =  d => scale(d.group);

        // Select the svg #mychart
        const svg = d3.select("#network-graph-svg")
            .attr("viewBox", [0, 0, width, height]);

        // Background
        svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "black");

        // Create a group
        const g = svg.append("g")

        // Append the links/edges to the group, under a new group
        const link = g.append("g:g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value) / 2);

        // Append the nodes to the group, under a new group
        const node = g.append("g:g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", 4)
            .attr("fill", color)
            .call(drag(simulation));

        svg.call(d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([.05, 8])
            .on("zoom", zoomed)) // Call zoomed() when zooming within the scaleExtent limits
            .on("wheel", event => event.preventDefault()); // Prevent scrolling when zoom limit reached

        // When zooming, transform the top level group
        function zoomed({transform}) {
            g.attr("transform", transform)
        }

        node.append("title")
            .text(d => d.id);
    
        // Called whenever the simulation runs, i.e. network force 'physics' are simulated
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });
    },
    template: `
        <div>
            <div style="
                border: 1px solid #e8e8e8;
                box-shadow: rgb(0 0 0 / 9%) 2px 2px 2px 0px;
            ">
                <div v-if="this.isLoading" class="d-flex justify-content-center">
                    <div class="spinner-grow mt-5 text-light" role="status">
                    </div>
                </div>
                <p v-if="!this.isLoading" class="m-2">
                    Nodes: <span class="badge bg-secondary">{{ this.data.nodes && this.data.nodes.length }}</span><br/>
                    Links: <span class="badge bg-secondary">{{ this.data.links && this.data.links.length }}</span>
                </p>
                <svg id="network-graph-svg">
                </svg>
            </div>
        </div>
    `
  })

