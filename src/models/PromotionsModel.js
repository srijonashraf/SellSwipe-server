import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    subject: String,
    title: String,
    content: String,
    userList: [Object],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const PromotionsModel = mongoose.model("promotions", promotionSchema);

export default PromotionsModel;
