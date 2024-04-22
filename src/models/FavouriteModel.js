import mongoose from "mongoose";

const FavouriteSchema = mongoose.Schema(
  {
    postID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const FavouriteModel = mongoose.model("favourites", FavouriteSchema);

export default FavouriteModel;
