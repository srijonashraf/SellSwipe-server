export default async (price, discountPercentage) => {
  return price - (price * discountPercentage) / 100;
};
