import {
  approveNidService,
  declineNidService,
  getReviewNidListService,
  getUserListService,
  profileService,
  restrictAccountService,
  searchUserService,
  updateAvatarService,
  updateNidService,
  updatePasswordService,
  updateProfileService,
  warningAccountService,
  withdrawRestrictionsService,
} from "../services/UserServices.js";

export const profile = async (req, res, next) => {
  const result = await profileService(req, next);
  res.status(200).json(result);
};
export const updateProfile = async (req, res, next) => {
  const result = await updateProfileService(req, next);
  res.status(200).json(result);
};

export const updatePassword = async (req, res, next) => {
  const result = await updatePasswordService(req, next);
  res.status(200).json(result);
};

export const updateAvatar = async (req, res, next) => {
  const result = await updateAvatarService(req, next);
  res.status(200).json(result);
};

export const updateNid = async (req, res, next) => {
  const result = await updateNidService(req, next);
  res.status(200).json(result);
};

//_____Admin_____//
export const getUserList = async (req, res, next) => {
  const result = await getUserListService(req, next);
  res.status(200).json(result);
};

export const withdrawRestrictions = async (req, res, next) => {
  const result = await withdrawRestrictionsService(req, next);
  res.status(200).json(result);
};

export const warningAccount = async (req, res, next) => {
  const result = await warningAccountService(req, next);
  res.status(200).json(result);
};

export const restrictAccount = async (req, res, next) => {
  const result = await restrictAccountService(req, next);
  res.status(200).json(result);
};

export const getReviewNidList = async (req, res, next) => {
  const result = await getReviewNidListService(req, next);
  res.status(200).json(result);
};

export const approveNid = async (req, res, next) => {
  const result = await approveNidService(req, next);
  res.status(200).json(result);
};

export const declineNid = async (req, res, next) => {
  const result = await declineNidService(req, next);
  res.status(200).json(result);
};

export const searchUser = async (req, res, next) => {
  const result = await searchUserService(req, next);
  res.status(200).json(result);
};
