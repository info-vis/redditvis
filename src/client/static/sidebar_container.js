Vue.component("sidebar-container", {
    template: `
    <div class="row">
        <div class="col">
            <div class="border p-2 rounded my-1 border shadow-sm" style="background-color: white">
                <slot></slot>
            </div>
        </div>
    </div>
    `
  })
  