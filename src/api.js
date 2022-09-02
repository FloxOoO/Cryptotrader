const API_KEY =
  "4f90b4377134ca30e7f7435af76b95ac3497a716b5549401b16beb29fd5f3018";
const tickersHandlers = new Map();
const tickersInvalid = [];
var bc = new BroadcastChannel("updatePrice");
// На API
// const loadTickers = () => {
//   if (tickersHandlers.size === 0) {
//     return;
//   }
//   fetch(
//     `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
//       ...tickersHandlers.keys()
//     ]
//       .join(",")
//       .toUpperCase()}&tsyms=USD&api_key=${API_KEY}`
//   )
//     .then((r) => r.json())
//     .then((rawData) => {
//       const updatedPrices = Object.fromEntries(
//         Object.entries(rawData).map(([key, value]) => [key, value.USD])
//       );
//       Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
//         const handlers = tickersHandlers.get(currency) ?? [];
//         handlers.forEach((fn) => fn(newPrice));
//       });
//     });
// };
// setInterval(loadTickers, 5000);
// на WS
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
const AGGREGATE_INDEX = "5";
const INVALID_INDEX = "500";
socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice
  } = JSON.parse(e.data);
  if (type === INVALID_INDEX) {
    const { PARAMETER: tickerRequest } = JSON.parse(e.data);
    tickersInvalid.push(tickerRequest.split("").slice(9, -4).join(""));
  }
  if (
    (type !== AGGREGATE_INDEX && type !== INVALID_INDEX) ||
    newPrice === undefined
  ) {
    return;
  }
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => {
    fn(newPrice);
    bc.postMessage({ currency, newPrice });
  });
});
bc.onmessage = (e) => {
  const handlers = tickersHandlers.get(e.data.currency) ?? [];
  handlers.forEach((fn) => {
    fn(e.data.newPrice);
  });
};
function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }
  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}
function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
}
function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
}
export const subscribeToTicker = (ticker, cb) => {
  const subscribes = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribes, cb]);
  subscribeToTickerOnWs(ticker);
};
export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};
export const loadCoinlist = (Coinlist) => {
  fetch("https://min-api.cryptocompare.com/data/all/coinlist?summary=true")
    .then((r) => r.json())
    .then((rawData) =>
      Object.keys(rawData.Data).forEach((key) => Coinlist.push(key))
    );
};
export const getTickersInvalid = () => {
  return tickersInvalid;
};
