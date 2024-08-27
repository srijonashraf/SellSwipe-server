import Joi from "joi";
import mongoose from "mongoose";

const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Not a valid MongoDB ObjectId");
  }
  return value;
};

export const ticketSchemaCreate = Joi.object().keys({
  title: Joi.string().required(),
  description: Joi.string().required(),
  userID: Joi.string().custom(objectIdValidator),
  status: Joi.string().valid("Pending", "In-Progress", "Solved", "Closed"),
  priority: Joi.string().valid("Low", "Medium", "High"),
});

export const ticketSchemaUpdate = Joi.object().keys({
  id: Joi.string().custom(objectIdValidator),
  title: Joi.string(),
  description: Joi.string(),
  userID: Joi.string().custom(objectIdValidator),
  status: Joi.string().valid("Pending", "In-Progress", "Solved", "Closed"),
  priority: Joi.string().valid("Low", "Medium", "High"),
  resolvedAt: Joi.string(),
  assignedTo: Joi.string().custom(objectIdValidator),
  comment: Joi.string(),
});
