export default async (price, discountPrice) => {
  return ((price - discountPrice) / price) * 100;
};
