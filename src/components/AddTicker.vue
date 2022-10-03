<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="h1 block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            v-on:keydown.enter="add(ticker)"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <ticker-autocomplete :ticker="ticker" @add="add" />
        <div v-if="addTickerCheck" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <add-button
      @click="add(ticker)"
      type="button"
      :disabled="disabled"
      class="my-4"
    />
  </section>
</template>
<script>
import AddButton from "./AddButton.vue";
import TickerAutocomplete from "./TickerAutocomplete.vue";
export default {
  components: {
    AddButton,
    TickerAutocomplete
  },
  props: {
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    tickers: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  emits: {
    "add-ticker": (value) => typeof value === "string" && value.length > 0
  },
  data() {
    return {
      ticker: "",
      addTickerCheck: false
    };
  },
  methods: {
    add(span) {
      if (this.ticker.length === 0) {
        return;
      }
      this.addTickerCheck = this.tickers.some(
        (x) => x.name === span.toUpperCase()
      );
      if (this.addTickerCheck) {
        this.ticker = "";
        return;
      }
      span
        ? this.$emit("add-ticker", span)
        : this.$emit("add-ticker", this.ticker);
      this.ticker = "";
    }
  },
  watch: {
    ticker() {
      setTimeout(() => (this.addTickerCheck = false), 1000);
    }
  }
};
</script>
