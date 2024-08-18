import Joi from "joi";
import mongoose from "mongoose";

// Custom validation for MongoDB ObjectId
const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Not a valid MongoDB ObjectId");
  }
  return value;
};

//Pattern is used here to receive any type of key but the value must satisfy the validation rule
export const idSchema = Joi.object().pattern(
  Joi.string(), //key name not mentioned to accept any kind keys
  Joi.string().custom(objectIdValidator).required()
);
