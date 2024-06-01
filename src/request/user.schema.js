import Joi from "joi";
import mongoose from "mongoose";

// Custom validation for MongoDB ObjectId
const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Not a valid MongoDB ObjectId");
  }
  return value;
};

export const userSchemaCreate = Joi.object().keys({
  email: Joi.string().email().lowercase().required(),
  name: Joi.string().optional(),
  role: Joi.string().valid("User", "Admin").default("User"),
  avatar: Joi.object({
    url: Joi.string().uri().optional().allow(""),
    pid: Joi.string().optional().allow(""),
  }).optional(),
  password: Joi.string().required().messages({
    "string.empty": "Please enter a Password",
  }),
  nidNumber: Joi.number().optional(),
  nidFront: Joi.object({
    url: Joi.string().uri().optional(),
    pid: Joi.string().optional(),
  }).optional(),
  nidBack: Joi.object({
    url: Joi.string().uri().optional(),
    pid: Joi.string().optional(),
  }).optional(),
  nidSubmitted: Joi.boolean().default(false),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  nidVerified: Joi.boolean().optional(),
  emailVerified: Joi.boolean().default(false),
  phoneVerified: Joi.boolean().optional(),
  accountStatus: Joi.string()
    .valid("Validated", "Warning", "Restricted")
    .default("Validated"),
  warningCount: Joi.number().optional(),
  lastLogin: Joi.string().optional(),
  lastRefresh: Joi.string().optional(),
  sessionId: Joi.array()
    .items(Joi.string().custom(objectIdValidator))
    .optional(),
  loginAttempt: Joi.number().default(0),
  limitedLogin: Joi.string().optional(),
});

export const userSchemaUpdate = Joi.object().keys({
  email: Joi.string().email().lowercase(),
  name: Joi.string().optional(),
  role: Joi.string().valid("User", "Admin").default("User"),
  avatar: Joi.object({
    url: Joi.string().uri().optional().allow(""),
    pid: Joi.string().optional().allow(""),
  }).optional(),
  password: Joi.string(),
  nidNumber: Joi.number().optional(),
  nidFront: Joi.object({
    url: Joi.string().uri().optional(),
    pid: Joi.string().optional(),
  }).optional(),
  nidBack: Joi.object({
    url: Joi.string().uri().optional(),
    pid: Joi.string().optional(),
  }).optional(),
  nidSubmitted: Joi.boolean().default(false),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  nidVerified: Joi.boolean().optional(),
  emailVerified: Joi.boolean().default(false),
  phoneVerified: Joi.boolean().optional(),
  accountStatus: Joi.string()
    .valid("Validated", "Warning", "Restricted")
    .default("Validated"),
  warningCount: Joi.number().optional(),
  lastLogin: Joi.string().optional(),
  lastRefresh: Joi.string().optional(),
  sessionId: Joi.array()
    .items(Joi.string().custom(objectIdValidator))
    .optional(),
  loginAttempt: Joi.number().default(0),
  limitedLogin: Joi.string().optional(),
});
