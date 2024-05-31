import mongoose from "mongoose";
import PostModel from "../models/PostModel.js";
import {
  destroyOnCloudinary,
  uploadOnCloudinary,
} from "../utility/Cloudinary.js";
import PostDetailsModel from "./../models/PostDetailsModel.js";
import mapData from "../utility/CreatePost/MapData.js";
import calculateDiscountPercentage from "../utility/CreatePost/DiscountPercentage.js";
import calculateDiscountPrice from "../utility/CreatePost/DiscountPrice.js";

const ObjectID = mongoose.Types.ObjectId;

export const createPostService = async (req) => {
  try {
    const postID = new ObjectID(req.query.postId);
    let reqBody = req.body;
    reqBody.userID = new ObjectID(req.headers.id);
    const { PostData, PostDetailsData } = await mapData(reqBody);

    // Calculate discount percentage if discountPrice is provided
    if (PostData.discountPrice) {
      PostData.discount = true;
      PostData.discountPercentage = await calculateDiscountPercentage(
        PostData.price,
        PostData.discountPrice
      );
    }

    // Calculate discountPrice if discountPercentage is provided
    if (PostData.discountPercentage) {
      PostData.discount = true;
      PostData.discountPrice = await calculateDiscountPrice(
        PostData.price,
        PostData.discountPercentage
      );
    }

    // Upload images to Cloudinary and handle previous images
    if (req.files && req.files.length > 0) {
      const cloudinaryUrls = await uploadPostImagesService(req, postID);
      PostData.mainImg = {
        url: cloudinaryUrls[0].url,
        pid: cloudinaryUrls[0].pid,
      };

      for (let i = 1; i <= 5 && i < cloudinaryUrls.length; i++) {
        PostDetailsData[`img${i}`] = {
          url: cloudinaryUrls[i].url,
          pid: cloudinaryUrls[i].pid,
        };
      }
    }

    //Increment the editCount when updating post
    const updateQuery = req.query.postId
      ? {
          $set: PostData,
          $inc: { editCount: 1 },
          isApproved: false,
          onReview: true,
        }
      : {
          $set: PostData,
          $setOnInsert: {
            isApproved: false,
            onReview: true,
            editCount: 0,
          },
        };

    // Create post data
    const createdPostData = await PostModel.findOneAndUpdate(
      { _id: postID },
      updateQuery,
      { upsert: true, new: true }
    );

    // Create post details data
    PostDetailsData.postID = createdPostData._id;
    const createdPostDetailsData = await PostDetailsModel.findOneAndUpdate(
      { postID: postID },
      { $set: PostDetailsData },
      { upsert: true, new: true }
    );

    if (createdPostData && createdPostDetailsData) {
      return {
        status: "success",
        post: createdPostData,
        postDetails: createdPostDetailsData,
      };
    } else {
      return { status: "fail", message: "Failed to post your ad" };
    }
  } catch (error) {
    console.log(error);
    return { status: "fail", data: error };
  }
};

export const uploadPostImagesService = async (req, postID) => {
  try {
    //If file not found in req then return fail
    if (!req.files || req.files.length === 0) {
      return { success: "fail", message: "You must select at least one image" };
    }

    // Upload images to Cloudinary
    const filePaths = req.files.map((file) => file.path);

    const cloudinaryUrls = [];
    for (const filePath of filePaths) {
      const cloudinaryResponse = await uploadOnCloudinary(filePath);
      cloudinaryUrls.push({
        url: cloudinaryResponse.secure_url,
        pid: cloudinaryResponse.public_id,
      }); //Pass as an object
    }

    //Fetch existing image to delete
    const existingImages = await PostDetailsModel.findOne({ postID }).exec();
    const existingMainImages = await PostModel.findOne({ _id: postID }).exec();

    if (existingImages && existingMainImages) {
      await destroyOnCloudinary(existingMainImages.mainImg.pid);
      for (let i = 1; i <= 5; i++)
        if (existingImages[`img${i}`]) {
          await destroyOnCloudinary(existingImages[`img${i}`].pid);
        }
    }

    return cloudinaryUrls;
  } catch (error) {
    console.log(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const deletePostService = async (req) => {
  const session = await mongoose.startSession();
  try {
    const userID = new ObjectID(req.headers.id);
    const postID = new ObjectID(req.query.postId);

    session.startTransaction();

    const post = await PostModel.deleteOne({
      _id: postID,
      userID: userID,
    }).session(session);

    if (post.deletedCount !== 1) {
      await session.abortTransaction();
      session.endSession();
      return { status: "fail", message: "Failed to delete post" };
    }

    const postDetails = await PostDetailsModel.deleteOne({
      postID: postID,
    }).session(session);

    if (postDetails.deletedCount !== 1) {
      await session.abortTransaction();
      session.endSession();
      return { status: "fail", message: "Failed to delete post details" };
    }

    await session.commitTransaction();
    session.endSession();
    return { status: "success", message: "Post is deleted" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  } finally {
    session.endSession();
  }
};

export const deletePostDetailsImage = async (req) => {
  try {
    const postID = new ObjectID(req.query.postId);
    const pid = req.query.pid;
    const data = await PostDetailsModel.findOne({
      postID: postID,
    });

    if (!data) {
      return {
        status: "fail",
        message: "Failed to delete image of the post because no post found",
      };
    }

    // Iterate through the fields to find and unset the image field with the matching pid
    let updateQuery = {};
    for (let key in data._doc) {
      if (data[key] && data[key].pid === pid) {
        // console.log(data[key]); // this will print the value of img1; here key is img1 and the whole data is inside the data variable
        updateQuery[key] = "";
      }
    }

    // console.log(updateQuery); //this will show the key value pair of updated query; example: { img3: '' }
    // console.log(Object.keys(updateQuery)); //this will print the keys inside the object; example: ['img3']

    if (Object.keys(updateQuery).length === 0) {
      return { status: "fail", message: "Image not found" };
    }

    const result = await PostDetailsModel.updateOne(
      {
        postID: postID,
      },
      {
        $unset: updateQuery,
      },
      {
        new: true,
      }
    );

    if (result.modifiedCount > 0) {
      destroyOnCloudinary(pid);
      return { status: "success", message: "Selected image deleted" };
    } else {
      return { status: "fail", message: "Failed to delete image of the post" };
    }
  } catch (error) {
    console.log(error);
    return { status: "fail", message: "Something Went Wrong" };
  }
};

export const postListService = async (req) => {
  try {
    const data = await PostModel.aggregate([
      {
        $match: {
          isApproved: true,
          isActive: true,
          onReview: false,
          isDeclined: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $match: {
          "user.accountStatus": { $in: ["Validate", "Warning"] },
        },
      },
      {
        $project: {
          _id: 1,
          userID: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            phone: "$user.phone",
          },
          title: 1,
          mainImg: 1,
          price: 1,
          discount: 1,
          discountPrice: 1,
          stock: 1,
          isActive: 1,
          editCount: 1,
          viewsCount: 1,
          divisionID: 1,
          districtID: 1,
          areaID: 1,
          address: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    return { status: "success", data: data };
  } catch (error) {
    return { status: "fail", data: error };
  }
};
