export const baseUrl = (req) => {
  const result = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
  return result;
};
