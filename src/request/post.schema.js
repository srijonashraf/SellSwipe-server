import Joi from "joi";
import mongoose from "mongoose";

//Custom object validator
const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Not a valid MongoDB ObjectId");
  }
  return value;
};

const model = "Post";

export const postSchemaCreate = Joi.object().keys({
  title: Joi.string().required(),
  price: Joi.number().required(),
  discount: Joi.boolean(),
  discountPrice: Joi.number().when("discount", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  stock: Joi.string().required(),
  otherPhone: Joi.string().required(),
  onReview: Joi.boolean().default(true),
  isApproved: Joi.boolean().default(false),
  approvedBy: Joi.object(),
  isDeclined: Joi.boolean().default(false),
  declinedBy: Joi.object(),
  isActive: Joi.boolean().default(true),
  isDeleted: Joi.string(),
  editCount: Joi.number().default(0),
  reportAdmin: Joi.boolean(),
  reportedBy: Joi.string(),
  viewsCount: Joi.string(),
  divisionID: Joi.string().custom(objectIdValidator).required(),
  districtID: Joi.string().custom(objectIdValidator).required(),
  areaID: Joi.string().custom(objectIdValidator).required(),
  address: Joi.string().required(),
  feedback: Joi.string().optional(),
  description: Joi.string(),
  size: Joi.array().required(),
  color: Joi.array().required(),
  authenticity: Joi.string().required(),
  condition: Joi.string().required(),
  usedMonths: Joi.string().required(),
  brandID: Joi.string().custom(objectIdValidator).required(),
  modelID: Joi.string().custom(objectIdValidator).required(),
  categoryID: Joi.string().custom(objectIdValidator).required(),
  keyword: Joi.array().required(),
});

export const postSchemaUpdate = Joi.object().keys({
  userID: Joi.string().custom(objectIdValidator).required(),
  title: Joi.string().required(),
  price: Joi.number().required(),
  discount: Joi.boolean(),
  discountPrice: Joi.number().when("discount", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  stock: Joi.string().required(),
  otherPhone: Joi.string().required(),
  onReview: Joi.boolean().default(true),
  isApproved: Joi.boolean().default(false),
  approvedBy: Joi.object(),
  isDeclined: Joi.boolean().default(false),
  declinedBy: Joi.object(),
  isActive: Joi.boolean().default(true),
  isDeleted: Joi.string(),
  editCount: Joi.number().default(0),
  reportAdmin: Joi.boolean(),
  reportedBy: Joi.string(),
  viewsCount: Joi.string(),
  divisionID: Joi.string().custom(objectIdValidator).required(),
  districtID: Joi.string().custom(objectIdValidator).required(),
  areaID: Joi.string().custom(objectIdValidator).required(),
  address: Joi.string().required(),
  feedback: Joi.string().optional(),
  description: Joi.string(),
  size: Joi.array().required(),
  color: Joi.array().required(),
  authenticity: Joi.string().required(),
  condition: Joi.string().required(),
  usedMonths: Joi.string().required(),
  brandID: Joi.string().custom(objectIdValidator).required(),
  modelID: Joi.string().custom(objectIdValidator).required(),
  categoryID: Joi.string().custom(objectIdValidator).required(),
  keyword: Joi.array().required(),
});

export const postSchemaId = Joi.object().keys({
  id: Joi.string().custom(objectIdValidator).required(),
});
