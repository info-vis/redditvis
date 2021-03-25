Vue.component("aggregate-container", {
  template: `
    <div class="col d-flex align-items-stretch">
      <div class="card" style="background-color: #eeeeee; width: 10rem">
        <div class="card-body" style="text-align:center">
          <h3 class="card-title" style="font-size:25px; color:#408acf">{{ aggregateData.data["Fraction of alphabetical characters"] }}%</h3>
          <h6 class="card-subtitle mb-2 text-muted" style="font-size:15px">Global Average: {{aggregateData.data_avg["Fraction of alphabetical characters"]}}%</h6>
          <p class="card-text" style="font-size:12px">Fraction of Alphabetical Characters</p>
        </div>
      </div>
    </div>
  `
})
