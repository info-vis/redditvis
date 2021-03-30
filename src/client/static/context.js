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
            Information
            </button>
        </p>
        <div class="card card-body" v-if="isCollapsed">
        <h4>Welcome to RedditVis!</h4>

        <p><b>RedditVis</b> is a multiview visual analytics system that allows to explore the network of 
        subreddits relations and analyse the details of linguistic and semantic post properties 
        between selected subreddits. You can interactively select subreddits of interest that exist 
        in the network and explore further details. Identify relationships, 
        patterns and trends within the data.</p>

        <p>To the <b>left</b> of the network, you see the force control. This allows you to alter 
        certain elements of the networks appearance.</p>
        
        <p>To the <b>right</b> of the network, you see the subreddit selection boxes. 
        Simply type your desired subreddit or select from the dropdown menu. 
        Once you have written your selection, simply press the blue button to select the subreddit. Press
        the gray button to pipoint on the network and press the red button to delete your selection.</p> 

        <p><b>Below</b> the network, you can see the aggregate values and plots associated with the data. 
        The "i" button next to the plots will give you extra information about themselves.</p>


        </div>
    </div>
    `
})