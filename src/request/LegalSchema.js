import Joi from "joi";
import mongoose from "mongoose";

const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Not a valid MongoDB ObjectId");
  }
  return value;
};

export const legalSchemaCreate = Joi.object({
  type: Joi.string().required().messages({
    "string.empty": "Type is required.",
    "any.required": "Type is required.",
  }),

  description: Joi.string().required().allow(null, "").messages({
    "string.empty": "Description cannot be an empty string.",
  }),
});

export const legalSchemaUpdate = Joi.object({
  id: Joi.string().custom(objectIdValidator),
  type: Joi.string().optional().messages({
    "string.empty": "Type is required.",
    "any.required": "Type is required.",
  }),

  description: Joi.string().optional().allow(null, "").messages({
    "string.empty": "Description cannot be an empty string.",
  }),
});
