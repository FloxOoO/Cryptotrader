<template>
  <section v-if="selectedTicker" class="relative">
    <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
      {{ selectedTicker.name }} - USD
    </h3>
    <div
      ref="graph"
      class="flex items-end border-gray-600 border-b border-l h-64"
    >
      <div
        ref="graphBar"
        v-for="(bar, idx) in normalizedGraph"
        :key="idx"
        :style="{
          height: `${bar.height}%`,
          width: `${bar.width}px`
        }"
        class="bg-purple-800 border"
      ></div>
    </div>
    <delete-graph-button @closed-graph="closeGraph" />
    <!-- <button
      @click="selectedTicker = null"
      type="button"
      class="absolute top-0 right-0"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:svgjs="http://svgjs.com/svgjs"
        version="1.1"
        width="30"
        height="30"
        x="0"
        y="0"
        viewBox="0 0 511.76 511.76"
        style="enable-background: new 0 0 512 512"
        xml:space="preserve"
      >
        <g>
          <path
            d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
            fill="#718096"
            data-original="#000000"
          ></path>
        </g>
      </svg>
    </button> -->
  </section>
</template>
<script>
import DeleteGraphButton from "./DeleteGraphButton.vue";
export default {
  components: {
    DeleteGraphButton
  },
  props: {
    selectedTicker: {
      type: Object
    }
  },
  data() {
    return {
      graph: [],
      maxGraphElements: 1,
      widthGraph: 1,
      countBar: 1
    };
  },
  mounted() {
    window.addEventListener("resize", this.resizeGraph);
  },
  beforeMount() {
    window.removeEventListener("resize", this.resizeGraph);
  },
  watch: {
    selectedTicker() {
      this.graph = [];
    },
    priceUpdate() {
      this.graph.push({
        height: this.selectedTicker.price,
        width: this.selectedTicker.time
      });
      if (this.$refs.graphBar) {
        this.widthGraph = 0;
        this.countBar = 0;
        this.$refs.graphBar.forEach((x) => {
          this.widthGraph += Math.ceil(x.clientWidth) + 2;
          this.countBar++;
        });
      }
      if (this.$refs.graph?.clientWidth < this.widthGraph) {
        this.graph.shift();
      }
    }
  },
  methods: {
    closeGraph(flag) {
      if (flag) {
        this.graph = [];
        this.$emit("delete-select", flag);
      }
    },
    resizeGraph() {
      if (!this.$refs.graph) {
        return;
      }
      this.maxGraphElements = this.$refs.graph.clientWidth / this.widthBar;
      if (this.graph.length > this.maxGraphElements) {
        this.graph = this.graph.slice(
          this.graph.length - this.maxGraphElements
        );
      }
    }
  },
  computed: {
    normalizedGraph() {
      let price = [];
      let normalizedGraph = [];
      this.graph.forEach((x) => {
        price.push(Object.entries(x)[0][1]);
      });
      const maxValueH = Math.max(...price);
      const minValueH = Math.min(...price);
      if (maxValueH === minValueH) {
        return this.graph.map((x) => (Object.entries(x)[0][1] = 50));
      }
      price = price.map(
        (x) => 5 + ((x - minValueH) * 95) / (maxValueH - minValueH)
      );
      this.searchIntervalTime.forEach((x, idx) => {
        normalizedGraph.push(
          Object.fromEntries([
            ["height", price[idx]],
            ["width", x > 100 ? x / 100 : 10]
          ])
        );
      });
      return normalizedGraph;
    },
    searchIntervalTime() {
      let intervals = [];
      for (let i = 0; i < this.graph.length - 1; i++) {
        intervals.push(
          Object.entries(this.graph[i + 1])[1][1] -
            Object.entries(this.graph[i])[1][1]
        );
      }
      return intervals;
    },
    widthBar() {
      return this.widthGraph / this.countBar;
    },
    priceUpdate() {
      if (this.selectedTicker) {
        return this.selectedTicker.price;
      }
      return null;
    }
  }
};
</script>
