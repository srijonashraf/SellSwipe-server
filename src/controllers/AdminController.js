import {
  addNewAdminService,
  adminListService,
  adminLoginService,
  deleteAdminService,
  restrictedAccountListService,
  userListService,
  warnedAccountListService,
  withdrawRestrictionsService,
} from "./../services/AdminServices.js";
export const adminLogin = async (req, res) => {
  const result = await adminLoginService(req);

  let cookieOption = {
    maxAge: Math.floor(Date.now() / 1000) + 6 * 24 * 60 * 60,
    httpOnly: true,
  };
  res.cookie("accessToken", result.accessToken, cookieOption);
  res.cookie("refreshToken", result.refreshToken, cookieOption);
  res.status(200).json(result);
};

export const addNewAdmin = async (req, res) => {
  const result = await addNewAdminService(req);
  res.status(200).json(result);
};

export const deleteAdmin = async (req, res) => {
  const result = await deleteAdminService(req);
  res.status(200).json(result);
};

export const adminList = async (req, res) => {
  const result = await adminListService(req);
  res.status(200).json(result);
};

export const userList = async (req, res) => {
  const result = await userListService(req);
  res.status(200).json(result);
};

export const warnedAccountList = async (req, res) => {
  const result = await warnedAccountListService(req);
  res.status(200).json(result);
};

export const restrictedAccountList = async (req, res) => {
  const result = await restrictedAccountListService(req);
  res.status(200).json(result);
};

export const withdrawRestrictions = async (req, res) => {
  const result = await withdrawRestrictionsService(req);
  res.status(200).json(result);
};





