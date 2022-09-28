<template v-if="wordsHelpSearch.length">
  <span
    v-for="(span, idx) in wordsHelpSearch"
    :key="idx"
    class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
    @click="$emit('add', span)"
  >
    {{ span }}
  </span>
</template>
<script>
import { loadCoinlist } from "@/api.js";
export default {
  props: {
    ticker: {
      type: String
    }
  },
  emits: {
    add: (value) => typeof value === "string"
  },
  data() {
    return {
      wordsHelpSearch: [],
      Coinlist: []
    };
  },
  created() {
    Object.freeze(loadCoinlist(this.Coinlist));
  },
  methods: {
    HelpSearch() {
      let Cointemp = [];
      if (this.ticker.length) {
        this.Coinlist.forEach((coin) => {
          if (
            coin.split("").slice(0, this.ticker.length).join("") ===
            this.ticker.toUpperCase()
          ) {
            Cointemp.push(coin);
          }
        });
      }
      Cointemp = Cointemp.filter((x) => x.includes(this.ticker.toUpperCase()));
      this.wordsHelpSearch = Cointemp.length
        ? [Cointemp[0], Cointemp[1], Cointemp[2], Cointemp[3]]
        : [];
    }
  },
  watch: {
    ticker() {
      this.HelpSearch();
    }
  }
};
</script>
