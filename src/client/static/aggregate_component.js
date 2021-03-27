Vue.component("aggregate-component", {
  props: {
    title: String,
    value: Number,
    globalAverage: {
      type: Number,
      default: null
    }
  },
  computed: {
    difference: function() {
      const result = this.value - this.globalAverage
      return Number.parseFloat(result).toPrecision(2)
    },
    differenceStyle: function() {
      if (this.difference > 0) {
        return {"color": "green"}
      } else if (this.difference < 0) {
        return {"color": "red"}
      }
      return {"color": "gray"}
    },
    cardBodyClasses: function() {
      let classes = "card-body p-1 text-center"
      if (!this.globalAverage) {
        classes += " position-relative"
      }
      return classes
    },
    cardTitleClasses: function() {
      let classes = "card-title mb-1"
      if (!this.globalAverage) {
        classes += " position-absolute top-50 start-50 translate-middle fs-3"
      }
      return classes
    }
  },
  template: `
    <div class="card" style="width: 10rem">
      <div class="card-header p-1 text-center">
        {{ title }}
      </div>
      <div :class="cardBodyClasses">
        <h5 :class="cardTitleClasses" style="color:#408acf;">
          {{ value.toLocaleString() }}
        </h5>
        <p v-if="globalAverage" class="card-text mb-1" style="font-size:11px;color:#003e78">
          Global average: {{ globalAverage.toLocaleString() }}
        </p>
        <p v-if="globalAverage" class="card-text mb-1" style="font-size: 11px;/* color: #d32f2f; */">
          Difference: <span :style="differenceStyle">{{ difference }}</span>
          </p>
      </div>
    </div>
  `
})
