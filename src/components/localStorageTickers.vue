<template>
  <div></div>
</template>
<script>
export default {
  props: {
    tickers: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  emits: {
    "tickers-data-LS": (value) => typeof value === "object"
  },
  created() {
    this.$emit(
      "tickers-data-LS",
      JSON.parse(localStorage.getItem("cryptonomicon-list"))
    );
  },
  watch: {
    tickers() {
      localStorage.setItem("cryptonomicon-list", JSON.stringify(this.tickers));
    }
  }
};
</script>
