const RATES = {
  USD: { symbol: "$", rate: 1, name: "US Dollar" },
  EUR: { symbol: "\u20ac", rate: 0.92, name: "Euro" },
  GBP: { symbol: "\u00a3", rate: 0.79, name: "British Pound" },
  INR: { symbol: "\u20b9", rate: 83.2, name: "Indian Rupee" },
  JPY: { symbol: "\u00a5", rate: 156.4, name: "Japanese Yen" },
  AUD: { symbol: "A$", rate: 1.52, name: "Australian Dollar" },
  CAD: { symbol: "C$", rate: 1.36, name: "Canadian Dollar" }
};
function convert(usdAmount, currency) {
  const c = RATES[currency] || RATES.USD;
  return +(usdAmount * c.rate).toFixed(2);
}
function format(usdAmount, currency) {
  const c = RATES[currency] || RATES.USD;
  const val = convert(usdAmount, currency);
  return c.symbol + val.toFixed(currency === "JPY" ? 0 : 2);
}
module.exports = { RATES, convert, format };
