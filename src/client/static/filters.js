// Define a new component called graph-network
Vue.component('filters', {
    data: function() {
        return {
            data: [
                "afganustan",
                
            ]
        }
    },
    template: `<div id="filters">
    <h3>Filters</h3>
    <select class="form-select" aria-label="Default select example">
        <option selected>Open this select menu</option>
        <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3">Three</option>
    </select>
    </div>`
  })
