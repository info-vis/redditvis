Vue.component('context-box', {
    name: 'context-box',
    data: function () {
        return {
            isCollapsed: false
        }
    },
    template: `
    <div>
        <p>
            <button class="btn btn-primary" v-on:click="isCollapsed = !isCollapsed">
            About RedditVis
            </button>
        </p>
            <div class="card card-body" v-if="isCollapsed">
            <h4>Welcome to RedditVis!</h4>

            <p>
            <b>RedditVis</b> is a multiview visual analytics system that allows to explore the network of 
            subreddits relations and analyse the details of linguistic and semantic post properties 
            between selected subreddits. You can interactively select subreddits of interest that exist 
            in the network and explore further details, Identify relationships, 
            patterns and trends within the data.
            </p>

            <p>
            As a basis for the RedditVis development, a dataset from the Stanford Network Analysis Platform (SNAP) 
            at the Stanford University was used. The dataset consists of a Reddit hyperlink network data 
            from January 2014 to April 2017. The data covers 137,113 cross-link interactions made 
            between 36,000 subreddits.
            </p>
            </div>
        </div>  `
})
