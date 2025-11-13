const formatter = new Intl.NumberFormat('ko-KR');

const formatNumber = (value) => {
  return formatter.format(value);
};

export const NumberUtil = {
  formatNumber,
};
