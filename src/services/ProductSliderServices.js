import PostModel from "../models/PostModel.js";
import { postValidationQuery } from "../utils/PostValidationUtility.js";
import SliderModel from "../models/SliderModel.js";

export const fetchLatestPostandSetSliderService = async () => {
  try {
    const postValidation = postValidationQuery();

    const latestPosts = await PostModel.aggregate([
      {
        $match: postValidation,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "postdetails",
          localField: "_id",
          foreignField: "postID",
          as: "postdetails",
        },
      },
      {
        $unwind: {
          path: "$postdetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          mainImg: 1,
          "postdetails.categoryID": 1,
        },
      },
    ]);
    await Promise.all(
      latestPosts.map((post) =>
        SliderModel.create({
          postID: post._id,
          categoryID: post.postdetails.categoryID,
        })
      )
    );
  } catch (error) {
    console.error("Error fetching latest posts for slider:", error);
  }
};

export const getProductSliderService = async (req, next) => {
  try {
    const id = req.query.categoryId;
    const sliders = await SliderModel.find({ categoryID: id })
      .limit(5)
      .sort({ createdAt: -1 });
    return { status: "success", total: sliders.length, data: sliders };
  } catch (error) {
    next(error);
  }
};
