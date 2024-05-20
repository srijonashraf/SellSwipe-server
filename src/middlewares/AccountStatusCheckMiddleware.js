//This middleware is used to check if the accountStatus is Validate then user will be able to post.

export const checkAccountStatus = async (req, res, next) => {
  const userID = req.headers.id || req.cookies.id;
//   console.log(userID);

  next();
};
