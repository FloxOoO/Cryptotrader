<template>
  <div>
    <button
      class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      v-if="page > 1"
      @click="page = page - 1"
    >
      Назад
    </button>
    <button
      v-if="hasNextPage"
      @click="page = +page + 1"
      class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
    >
      Вперед
    </button>
    <div>
      <label for="wallet" class="h1 text-sm font-medium text-gray-700"
        >Фильтр:
      </label>
      <input
        v-model="filter"
        type="text"
        name="wallet"
        id="wallet"
        class="pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
      />
    </div>
  </div>
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
  // emits: {
  //   "processed-tickers": (value) => value
  // },
  data() {
    return {
      filter: "",
      page: 1
    };
  },
  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );
    if (windowData.filter) {
      this.filter = windowData.filter;
    }
    if (windowData.page) {
      this.page = windowData.page;
    }
  },
  watch: {
    filter() {
      this.page = 1;
    },
    pageStateOptions(v) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${v.filter}&page=${v.page}`
      );
    },
    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    }
  },
  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },
    endIndex() {
      return this.page * 6;
    },
    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.name.includes(this.filter.toUpperCase())
      );
    },
    paginatedTickers() {
      this.$emit(
        "processed-tickers",
        this.filteredTickers.slice(this.startIndex, this.endIndex)
      );
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },
    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },
    pageStateOptions() {
      this.$emit("clear-filter", this.filter);
      return {
        filter: this.filter,
        page: this.page
      };
    }
  }
};
</script>
