const request = require('request');
const crypto = require('crypto');
const ftx = require('lib/exchanges/ftx.js');

const account = {
  apiKey: `abc123`,
  apiSecret: `abc345`,
  subAccount: `HEDGE1`,
  inTrade: false,
}

const calculateSMA = (arr, range=false) => {
  if (!range) range = arr.length;
  let sum = 0;
  if (range > arr.length) range = arr.length;
  for (let ii = arr.length - range; ii < arr.length; ii++){
    sum += arr[ii];
  }
  return sum / range;
}

const calculateEMA = (arr,range=false) => {
  if (!range) range = arr.length;
  const yma = arr.reduce((p,n,i) => i ? p.concat(2*n/(range+1) + p[p.length-1]*(range-1)/(range+1)) : p, [arr[0]]);
  return yma[yma.length-1];
}

const checkStrategy = async () => {
  const res1Promise = fetch(`https://ftx.com/api/markets/BTC-PERP/candles?resolution=3600&limit=200`).catch(err => utils.errorLog(err));
  const res1 = await res1Promise;
  const ftxCandles = await res1.json().catch(err => utils.errorLog(err));
  const priceArray = [];
  ftxCandles.result.forEach((min,i) => {
    priceArray.push(min.close);
  });
  const fastEMA = calculateEMA(priceArray.slice(-24));
  const fastSMA = calculateSMA(priceArray.slice(-24));
  const slowEMA = calculateEMA(priceArray.slice(-200));
  const hedgeCondition1 = (fastEMA < fastSMA);
  const hedgeCondition2 = (fastEMA < slowEMA);
  if (hedgeCondition1 && hedgeCondition2 && account.inTrade === false) {
    account.inTrade = true;
    ftx.Order('SELL', 'BTC-PERP', 1, fastEMA * 0.95, account);
    // Send an alarm notification and do logic to confirm trade went through
  }
}

setInterval(() => {
  checkStrategy();
}, 60000);