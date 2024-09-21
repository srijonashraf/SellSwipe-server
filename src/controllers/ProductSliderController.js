import {
  fetchLatestPostandSetSliderService,
  getProductSliderService,
} from "../services/ProductSliderServices.js";

export const getProductSlider = async (req, res, next) => {
  const result = await getProductSliderService(req, next);
  res.status(200).json(result);
};
export const fetchLatestPostandSetSlider = async (req, res, next) => {
  const result = await fetchLatestPostandSetSliderService(req, next);
  res.status(200).json(result);
};
