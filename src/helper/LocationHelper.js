export const fetchLocation = async (req) => {
  try {
    const ip = req.headers["x-forwarded-for"];
    const fetchResponse = await fetch(`http://ip-api.com/json/${ip}`);
    const location = await fetchResponse.json();
    return location;
    // console.log(location)
  } catch (error) {
    console.error("Error fetching location:", error);
    return null;
  }
};
