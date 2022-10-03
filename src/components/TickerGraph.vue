<template>
  <section class="relative">
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
  emits: {
    "delete-select": (value) => typeof value === "boolean"
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
