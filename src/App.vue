<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <preloader-show />
    <div class="container">
      <div class="w-full my-4"></div>
      <add-ticker
        @add-ticker="add"
        :disabled="tooManyTickersAdded"
        :add-ticker-check="addTickerCheck"
      />
      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-2" />
        <pagination-filter-tickers
          :tickers="tickers"
          @processed-tickers="paginatedTickers"
        />
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <template v-for="t in paginatedTickersData" :key="t.name">
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
        <button
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
        </button>
      </section>
    </div>
  </div>
</template>
<script>
// [x] Наличие в состоянии ЗАВИСИМЫХ ДАННЫХ | 5+
// [x] При удалении остается подписка на загрузку тикера | 5/5
// [x] Запросы напрямую внутри компонента | 5/5
// [x] Обработка ошибок API | 5/5
// [x] Количество запросов | 4/5
// [x] При удалении тикера не изменяется localStorage | 4/5
// [x] Одинаковый код в watch | 3/5
// [ ] localStorage и анонимные вкладки | 3/5
// [x] График ужасно выглядит если много цен | 2/5
// [ ] Магические строки и числа (URL, 5000 мс задержка, ключ localStorage, количество на странице) | 1/5
// Доп
// [x] График сломан если везде одинаковые значения
// [x] При удалении тикера остается выбор
// [x] Крутые вебсокеты на бродкаст чаннел ебать с русланом
import { subscribeToTicker, unsubscribeFromTicker } from "./api";
import AddTicker from "./components/AddTicker.vue";
import PreloaderShow from "./components/PreloaderShow.vue";
import PaginationFilterTickers from "./components/PaginationFilterTickers.vue";
export default {
  name: "App",
  components: {
    AddTicker,
    PreloaderShow,
    PaginationFilterTickers
  },
  data() {
    return {
      tickers: [],
      selectedTicker: null,
      graph: [],
      addTickerCheck: false,
      maxGraphElements: 1,
      widthGraph: 1,
      countBar: 1,
      paginatedTickersData: []
    };
  },
  created() {
    const tickersData = localStorage.getItem("cryptonomicon-list");
    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker.name, (newPrice, valid, time) =>
          this.updateTicker(ticker.name, newPrice, valid, time)
        );
      });
    }
    // setInterval(this.updateTickers, 5000);
  },
  mounted() {
    window.addEventListener("resize", this.resizeGraph);
  },
  beforeMount() {
    window.removeEventListener("resize", this.resizeGraph);
  },
  methods: {
    paginatedTickers(t) {
      if (t) {
        console.log(t);
        this.paginatedTickersData = t;
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
    },
    updateTicker(tickerName, price, valid, time) {
      this.tickers
        .filter((t) => t.name === tickerName)
        .forEach((t) => {
          if (t === this.selectedTicker) {
            this.graph.push({ height: price, width: time });
            if (this.$refs.graphBar) {
              this.widthGraph = 0;
              this.countBar = 0;
              this.$refs.graphBar.forEach((x) => {
                this.widthGraph += Math.ceil(x.clientWidth) + 2;
                this.countBar++;
              });
            }
            if (this.$refs.graph.clientWidth < this.widthGraph) {
              this.graph.shift();
            }
          }
          if (valid === true) {
            t.price = price;
          }
          t.valid = valid;
        });
    },
    formatPrice(price) {
      if (price === "-") {
        return price;
      }
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },
    add(ticker) {
      if (ticker) {
        const currentTicker = {
          name: ticker.toUpperCase(),
          price: "-",
          valid: true
        };
        this.addTickerCheck = this.tickers.some(
          (x) => x.name === ticker.toUpperCase()
        );
        if (this.addTickerCheck) {
          this.ticker = "";
          return;
        }
        this.tickers = [...this.tickers, currentTicker];
        subscribeToTicker(currentTicker.name, (newPrice, valid, time) =>
          this.updateTicker(currentTicker.name, newPrice, valid, time)
        );
      }
    },
    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t !== tickerToRemove);
      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }
      unsubscribeFromTicker(tickerToRemove.name);
    },
    select(ticker) {
      this.selectedTicker = ticker;
    }
  },
  watch: {
    tickers() {
      localStorage.setItem("cryptonomicon-list", JSON.stringify(this.tickers));
    },
    selectedTicker() {
      this.graph = [];
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
    tooManyTickersAdded() {
      return this.tickers.length > 4;
    }
  }
};
</script>
