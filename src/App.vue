<template>
  <local-storage-tickers
    :tickers="tickers"
    @tickers-data-LS="getTickersFromLS"
  />
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <preloader-show />
    <div class="container">
      <div class="w-full my-4"></div>
      <add-ticker
        @add-ticker="add"
        :disabled="tooManyTickersAdded"
        :tickers="tickers"
      />
      <template v-if="tickers.length">
        <pagination-filter-tickers
          :tickers="tickers"
          @deleted-ticker="handleDelete"
        />
      </template>
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
import localStorageTickers from "./components/localStorageTickers.vue";
export default {
  name: "App",
  components: {
    AddTicker,
    PreloaderShow,
    PaginationFilterTickers,
    localStorageTickers
  },
  data() {
    return {
      tickers: []
    };
  },
  created() {
    this.getTickersFromLS();
  },
  methods: {
    getTickersFromLS(tickersData) {
      if (tickersData) {
        this.tickers = tickersData;
        this.tickers.forEach((ticker) => {
          subscribeToTicker(ticker.name, (newPrice, valid, time) =>
            this.updateTicker(ticker.name, newPrice, valid, time)
          );
        });
      }
    },
    updateTicker(tickerName, price, valid, time) {
      this.tickers
        .filter((t) => t.name === tickerName)
        .forEach((t) => {
          if (valid === true) {
            t.price = price;
          }
          t.valid = valid;
          t.time = time;
        });
    },
    add(ticker) {
      if (ticker) {
        const currentTicker = {
          name: ticker.toUpperCase(),
          price: "-",
          valid: true,
          time: 0
        };
        this.tickers = [...this.tickers, currentTicker];
        subscribeToTicker(currentTicker.name, (newPrice, valid, time) =>
          this.updateTicker(currentTicker.name, newPrice, valid, time)
        );
      }
    },
    handleDelete(tickerToRemove) {
      if (tickerToRemove)
        this.tickers = this.tickers.filter((t) => t !== tickerToRemove);
      unsubscribeFromTicker(tickerToRemove.name);
    }
  },
  computed: {
    tooManyTickersAdded() {
      return this.tickers.length > 30;
    }
  }
};
</script>
