import {
  assignNewAdminToTicketService,
  commentByAdminService,
  commentByUserService,
  createTicketByAdminService,
  createTicketByUserService,
  getAllTicketService,
  getUserTicketService,
  updateTicketStatusandPriorityService,
} from "../services/TicketServices.js";

export const createTicketByUser = async (req, res, next) => {
  const result = await createTicketByUserService(req, next);
  res.status(200).json(result);
};

export const getTicket = async (req, res, next) => {
  const result = await getUserTicketService(req, next);
  res.status(200).json(result);
};

export const commentByUser = async (req, res, next) => {
  const result = await commentByUserService(req, next);
  res.status(200).json(result);
};

export const createTicketByAdmin = async (req, res, next) => {
  const result = await createTicketByAdminService(req, next);
  res.status(200).json(result);
};

export const commentByAdmin = async (req, res, next) => {
  const result = await commentByAdminService(req, next);
  res.status(200).json(result);
};

export const getAllTicket = async (req, res, next) => {
  const result = await getAllTicketService(req, next);
  res.status(200).json(result);
};

export const updateTicketStatusandPriority = async (req, res, next) => {
  const result = await updateTicketStatusandPriorityService(req, next);
  res.status(200).json(result);
};

export const assignNewAdminToTicket = async (req, res, next) => {
  const result = await assignNewAdminToTicketService(req, next);
  res.status(200).json(result);
};
