import { AdminLoginService } from "./../services/AdminServices.js";
export const AdminLogin = async (req, res) => {
  const result = await AdminLoginService(req);
  res.status(200).json(result);
};
