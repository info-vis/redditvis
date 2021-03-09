// Vue.component('properties-radar', {
//     data: function () {
//         return {
//             isLoading: false, 
//             height: 300,
//             width: 200
//         }
//     },
//     props:{
//         sourceSubreddit: String,
//         targetSubreddit: String,
//         data: Object
//     }
//     watch: {
//         sourceSubreddit: "fetchAPIData",
//         targetSubreddit: "fetchAPIData"
//     },
//     methods: {
//         init() {
            
//         }

//         async fetchPlot():{

//         },

        
//         }
//         async fetchAPIData () {
//             this.isLoadingData = true
//             let url = `${apiEndpoint}properties-radar`
//             let sourceSubredditQuery = `source-subreddit=${this.sourceSubreddit}`
//             let targetSubredditQuery = `target-subreddit=${this.targetSubreddit}`
//             if (this.sourceSubreddit && this.targetSubreddit) {
//                 url = url + "?" + sourceSubredditQuery + "&" + targetSubredditQuery 
//             } else if (this.sourceSubreddit) {
//                 url = url + "?" + sourceSubredditQuery
//             } else if (this.targetSubreddit) {
//                 url = url + "?" + targetSubredditQuery

//             const response = await fetch(url);
//             const data = await response.json();
//             document.getElementById("properties-radar").innerHTML = "";
//             Bokeh.embed.embed_item(propertiesPlot, 'properties-radar')
            
//             this.isLoadingData = false
//           },
//     },

//     created: async function(){
//         this.fetchAPIData()
//     },

//     template: `
//     <div>
//         <div v-if="isLoading" class="d-flex justify-content-center">
//             <div class="spinner-grow my-5" role="status">
//             </div>
//         </div>
//         <div v-show="!isLoading">
//             <p class="mb-0 mt-1" >
//             <small> <strong> Top semantic properties </strong></small>
//             </p>
//         </div>
//         <div v-show="!isLoading" id="properties-radar" class="bk-root"></div>
//     </div> 
