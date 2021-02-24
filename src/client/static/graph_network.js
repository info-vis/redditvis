// Define a new component called graph-network
Vue.component('graph-network', {
    data: function () {
        return {
            data: {
                "nodes":[
                        {"id":"IAmA","group":10},
                        {"id":"abc","group":9},
                        {"id":"abc","group":8},
                        {"id":"abc","group":7},
                        {"id":"abc","group":6},
                        {"id":"abc","group":5},
                        {"id":"abc","group":4},
                        {"id":"Funny","group":1}
                ],
                "links":[
                    {"source":"IAmA","target":"Funny","value":1},
                    {"source":"abc","target":"IAmA","value":100}
                ]
            },
        }   
    },
    methods: {
        getData: async function() {
            console.log("Getting network data..")
            const response = await fetch(`${apiEndpoint}network?n=1000`);
            const data = await response.json();
            return data
        }
    },
    created: async function() {
        this.data = await this.getData()

        const height = 600
        const width = 1000
  
        const links = this.data.links.map(d => ({source: d[0], target: d[1], value: d[2]}))
        const nodes = this.data.nodes.map(d => ({id: d, group: Math.floor(Math.random() * Math.floor(10))}))
        console.log(links)
        console.log(nodes)

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody())
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

        const color = function () {
            const scale = d3.scaleOrdinal(d3.schemeCategory10);
            return d => scale(d.group);
        }

        const svg = d3.select("#mychart")
            .attr("viewBox", [0, 0, width, height]);

        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value) / 4);
            // .attr("stroke-width", d => Math.sqrt(d[2]));

        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", 5)
            .attr("fill", color)
            .call(drag(simulation));

        node.append("title")
            .text(d => d.id);
    
        // Called whenever a node is dragged, i.e. network 'physics' need to be simulated
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
        <div style="
            border: 1px solid #e8e8e8;
            box-shadow: rgb(0 0 0 / 9%) 2px 2px 2px 0px;;
        ">
            <svg id="mychart">
            </svg>
        </div>`
  })

