import mongoose from "mongoose";

const FavouriteSchema = mongoose.Schema(
  {
    postID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const FavouriteModel = mongoose.model("favourites", FavouriteSchema);

export default FavouriteModel;
