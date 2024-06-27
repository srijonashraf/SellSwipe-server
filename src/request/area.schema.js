import Joi from "joi";
import mongoose from "mongoose";

//Custom object validator
const objectIdValidator = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.message("Not a valid MongoDB ObjectId");
    }
    return value;
  };

  
