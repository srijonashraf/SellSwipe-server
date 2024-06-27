import Joi from "joi";
import mongoose from "mongoose";

// Custom validation for MongoDB ObjectId
const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Not a valid MongoDB ObjectId");
  }
  return value;
};

// Joi schema for creating an user
export const userSchemaCreate = Joi.object({
  email: Joi.string().email().lowercase().required(),
  name: Joi.string().required(),
  role: Joi.string().valid("User").default("User"),
  avatar: Joi.object({
    url: Joi.string().uri().allow(""),
    pid: Joi.string().allow(""),
  }),
  password: Joi.string().required().messages({
    "string.empty": "Please enter a Password",
  }),
  nidNumber: Joi.number(),
  nidFront: Joi.object({
    url: Joi.string().uri(),
    pid: Joi.string(),
  }),
  nidBack: Joi.object({
    url: Joi.string().uri(),
    pid: Joi.string(),
  }),
  nidSubmitted: Joi.boolean().default(false),
  phone: Joi.string(),
  address: Joi.string(),
  nidVerified: Joi.boolean(),
  emailVerified: Joi.boolean().default(false),
  phoneVerified: Joi.boolean(),
  accountStatus: Joi.string()
    .valid("Validate", "Warning", "Restricted")
    .default("Validate"),
  warningCount: Joi.number(),
  lastLogin: Joi.string(),
  lastRefresh: Joi.string(),
  sessionId: Joi.array().items(Joi.string().custom(objectIdValidator)),
  loginAttempt: Joi.number().default(0),
  limitedLogin: Joi.string(),
});

// Joi schema for updating an user
export const userSchemaUpdate = Joi.object({
  email: Joi.string().email().lowercase(),
  name: Joi.string(),
  role: Joi.string().valid("User"),
  avatar: Joi.object({
    url: Joi.string().uri().allow(""),
    pid: Joi.string().allow(""),
  }),
  password: Joi.string(),
  nidNumber: Joi.number(),
  nidFront: Joi.object({
    url: Joi.string().uri(),
    pid: Joi.string(),
  }),
  nidBack: Joi.object({
    url: Joi.string().uri(),
    pid: Joi.string(),
  }),
  nidSubmitted: Joi.boolean().default(false),
  phone: Joi.string(),
  address: Joi.string(),
  nidVerified: Joi.boolean(),
  emailVerified: Joi.boolean().default(false),
  phoneVerified: Joi.boolean(),
  accountStatus: Joi.string().valid("Validate", "Warning", "Restricted"),
  warningCount: Joi.number(),
  lastLogin: Joi.string(),
  lastRefresh: Joi.string(),
  sessionId: Joi.array().items(Joi.string().custom(objectIdValidator)),
  loginAttempt: Joi.number().default(0),
  limitedLogin: Joi.string(),
});

export const userEmailSchema = Joi.object().keys({
  email: Joi.string().email().lowercase().required(),
});

export const userCredentialSchema = Joi.object().keys({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required().messages({
    "string.empty": "Please enter a Password",
  }),
});
