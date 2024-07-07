import Joi from "joi";
import mongoose, { mongo } from "mongoose";

const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Not a valid MongoDB object");
  }
  return value;
};

// Joi schema for creating an admin
export const adminSchemaCreate = Joi.object({
  email: Joi.string().email().lowercase().required(),
  name: Joi.string()
    .pattern(/^[A-Za-z ]+$/)
    .required(),
  password: Joi.any().default(Joi.ref("email")).messages({
    "string.empty": "Please enter a password",
  }),
  role: Joi.string().valid("Admin", "SuperAdmin").required(),
  ref: Joi.object({
    name: Joi.string()
      .pattern(/^[A-Za-z ]+$/)
      .required(),
    id: Joi.string().custom(objectIdValidator).required(),
  }),
  approvedPosts: Joi.array().items(Joi.string().custom(objectIdValidator)),
  declinedPosts: Joi.array().items(Joi.string().custom(objectIdValidator)),
  warnedAccounts: Joi.array().items(Joi.string().custom(objectIdValidator)),
  restrictedAccounts: Joi.array().items(Joi.string().custom(objectIdValidator)),
  sessionId: Joi.array().items(Joi.string().custom(objectIdValidator)),
});

// Joi schema for updating an admin
export const adminSchemaUpdate = Joi.object({
  email: Joi.string().email().lowercase(),
  name: Joi.string().pattern(/^[A-Za-z ]+$/),
  password: Joi.string(),
  role: Joi.string().valid("Admin", "SuperAdmin"),
  ref: Joi.object({
    name: Joi.string().pattern(/^[A-Za-z ]+$/),
    id: Joi.string().custom(objectIdValidator),
  }),
  approvedPosts: Joi.array().items(Joi.string().custom(objectIdValidator)),
  declinedPosts: Joi.array().items(Joi.string().custom(objectIdValidator)),
  warnedAccounts: Joi.array().items(Joi.string().custom(objectIdValidator)),
  restrictedAccounts: Joi.array().items(Joi.string().custom(objectIdValidator)),
  sessionId: Joi.array().items(Joi.string().custom(objectIdValidator)),
});
