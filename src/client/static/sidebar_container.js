Vue.component("sidebar-container", {
    template: `
    <div class="row">
        <div class="col">
            <div class="border p-2 rounded border mb-2 shadow-sm" style="background-color: white">
                <slot></slot>
            </div>
        </div>
    </div>
    `
  })
  