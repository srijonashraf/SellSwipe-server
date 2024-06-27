export const fetchLocation = async (req) => {
  try {
    const fetchResponse = await fetch(`http://ip-api.com/json/${req.ip}`);
    const location = await fetchResponse.json();
    return location;
    // console.log(location)
  } catch (error) {
    console.error("Error fetching location:", error);
    return null;
  }
};
