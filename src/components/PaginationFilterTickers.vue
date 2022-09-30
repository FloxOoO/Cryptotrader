<template>
  <hr class="w-full border-t border-gray-600 my-2" />
  <URL
    :filter="filter"
    :page="page"
    @filter-from-url="filterFromUrl"
    @page-from-url="pageFromUrl"
  />
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
  <hr class="w-full border-t border-gray-600 my-4" />
  <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
    <template v-for="t in paginatedTickers" :key="t.name">
      <div
        @click="select(t)"
        :class="`${selectedTicker === t ? 'border-4' : ''} ${
          !t.valid ? 'bg-red-100' : 'bg-white'
        } overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer`"
      >
        <div class="px-4 py-5 sm:p-6 text-center">
          <dt class="text-sm font-medium text-gray-500 truncate">
            {{ t.name }} - USD
          </dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">
            {{ formatPrice(t.price) }}
          </dd>
        </div>
        <div class="w-full border-t border-gray-200"></div>
        <button
          @click.stop="handleDelete(t)"
          class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
        >
          <svg
            class="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="#718096"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd"
            ></path></svg
          >Удалить
        </button>
      </div>
    </template>
  </dl>
  <hr class="w-full border-t border-gray-600 my-4" />
</template>
<script>
import URL from "./URL.vue";
export default {
  components: {
    URL
  },
  props: {
    tickers: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  emits: {},
  data() {
    return {
      filter: "",
      page: 1,
      selectedTicker: null
    };
  },
  created() {
    this.filterFromUrl();
    this.pageFromUrl();
  },
  methods: {
    filterFromUrl(filter) {
      filter ? (this.filter = filter) : this.filter;
    },
    pageFromUrl(page) {
      page ? (this.page = page) : this.page;
    },
    formatPrice(price) {
      if (price === "-") {
        return price;
      }
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },
    handleDelete(tickerToRemove) {
      this.$emit("deleted-ticker", tickerToRemove);
      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }
    },
    select(ticker) {
      this.selectedTicker = ticker;
    }
  },
  watch: {
    filter() {
      this.page = 1;
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
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },
    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    }
  }
};
</script>
