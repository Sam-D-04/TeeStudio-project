const toMoney = (value) => {
  return Number(Number(value || 0).toFixed(2));
};

const calculatePercentAmount = (amount, percent) => {
  return toMoney((Number(amount || 0) * Number(percent || 0)) / 100);
};

const calculateFixedAmount = (amount) => {
  return toMoney(Math.max(Number(amount || 0), 0));
};

const clampDiscount = (amount, discount) => {
  return toMoney(Math.min(Number(amount || 0), Number(discount || 0)));
};

module.exports = {
  toMoney,
  calculatePercentAmount,
  calculateFixedAmount,
  clampDiscount,
};
