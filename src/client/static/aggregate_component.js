Vue.component("aggregate-component", {
  props: {
    title: String,
    value: Number,
    globalAverage: {
      type: Number,
      default: null
    },
    positivePosts: {
      type: Number,
      default: null
    },
    negativePosts: {
      type: Number,
      default: null
    }
  },
  computed: {
    hasPositivePosts: function() {
      return this.positivePosts != null
    },
    hasNegativePosts: function() {
      return this.negativePosts != null
    },
    difference: function() {
      const result = this.value - this.globalAverage
      return Number.parseFloat(result).toFixed(2)
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
      return classes
    },
    cardTitleClasses: function() {
      let classes = "card-title mb-1"
      return classes
    }
  },
  template: `
    <div class="card">
      <div class="card-header p-1 text-center" style="font-size: 10px">
        {{ title }} <span><slot></slot></span>
      </div>
      <div :class="cardBodyClasses">
        <h5 :class="cardTitleClasses" style="color:#40c4ff;">
          {{ value.toLocaleString() }}
        </h5>
        <p v-if="globalAverage" class="card-text mb-1" style="font-size:11px;color:#0288d1">
          Global average: <strong> {{ globalAverage.toLocaleString() }} </strong>
        </p>
        <p v-if="globalAverage" class="card-text mb-1" style="font-size: 11px;/* color: #d32f2f; */">
          Difference: <span :style="differenceStyle">{{ difference }}</span>
        </p>
        <p v-if="hasPositivePosts" class="card-text mb-1" style="font-size:11px;color:#ccd5d9">
          <span style="color:#ccd5d9"> Positive posts count: </span> <strong> {{ positivePosts.toLocaleString() }} </strong>
        </p>
        <p v-if="hasNegativePosts" class="card-text mb-1" style="font-size:11px;color:#ccd5d9">
          <span style="color:#ccd5d9"> Negative posts count: </span> <strong> {{ negativePosts.toLocaleString() }} </strong>
        </p>
      </div>
    </div>
  `
})
