<template>
  <div></div>
</template>
<script>
export default {
  props: {
    filter: {
      type: String,
      default: ""
    },
    page: {
      type: Number,
      default: 1
    }
  },
  emits: {
    "filter-from-url": (value) => typeof value === "string",
    "page-from-url": (value) => typeof value === "number"
  },
  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );
    if (windowData.filter) {
      this.$emit("filter-from-url", windowData.filter);
    }
    if (windowData.page) {
      this.$emit("page-from-url", +windowData.page);
    }
  },
  watch: {
    pageStateOptions(v) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${v.filter}&page=${v.page}`
      );
    }
  },
  computed: {
    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page
      };
    }
  }
};
</script>
