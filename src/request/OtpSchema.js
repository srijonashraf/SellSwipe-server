import Joi from "joi";
import mongoose from "mongoose";

const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Not a valid MongoDB ObjectId");
  }
  return value;
};

export const otpSchemaUpdate = Joi.object().keys({
  userID: Joi.string().custom(objectIdValidator),
  email: Joi.string().email().lowercase(),
  otp: Joi.number().max(999999),
  token: Joi.string(),
  expired: Joi.boolean(),
});
