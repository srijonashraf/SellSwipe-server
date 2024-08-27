import {
  createAdminService,
  deleteAdminService,
  getAdminListService,
  getAdminProfileService,
  loginService,
  searchAdminService,
  sendPromotionalEmailService,
  updateAdminService,
} from "./../services/AdminServices.js";
export const login = async (req, res, next) => {
  const result = await loginService(req, next);
  let cookieOption = {
    maxAge: Math.floor(Date.now() / 1000) + 6 * 24 * 60 * 60,
    httpOnly: true,
  };
  res.cookie("accessToken", result.accessToken, cookieOption);
  res.cookie("refreshToken", result.refreshToken, cookieOption);
  res.status(200).json(result);
};

export const getAdminProfile = async (req, res, next) => {
  const result = await getAdminProfileService(req, next);
  res.status(200).json(result);
};

export const createAdmin = async (req, res, next) => {
  const result = await createAdminService(req, next);
  res.status(200).json(result);
};

export const updateAdmin = async (req, res, next) => {
  const result = await updateAdminService(req, next);
  res.status(200).json(result);
};

export const deleteAdmin = async (req, res, next) => {
  const result = await deleteAdminService(req, next);
  res.status(200).json(result);
};

export const getAdminList = async (req, res, next) => {
  const result = await getAdminListService(req, next);
  res.status(200).json(result);
};

export const searchAdmin = async (req, res, next) => {
  const result = await searchAdminService(req, next);
  res.status(200).json(result);
};

export const sendPromotionalEmail = async (req, res, next) => {
  const result = await sendPromotionalEmailService(req, next);
  res.status(200).json(result);
};
