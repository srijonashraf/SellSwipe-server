import mongoose from "mongoose";
import PostModel from "../models/PostModel.js";
import {
  destroyOnCloudinary,
  uploadOnCloudinary,
} from "../utility/Cloudinary/Cloudinary.js";
import PostDetailsModel from "./../models/PostDetailsModel.js";
import mapData from "../utility/CreatePost/MapData.js";
import { removeUnusedLocalFile } from "../helper/RemoveUnusedFilesHelper.js";

const ObjectID = mongoose.Types.ObjectId;

export const createPostService = async (req, next) => {
  try {
    let reqBody = req.body;
    reqBody.userID = new ObjectID(req.headers.id);
    const { PostData, PostDetailsData } = await mapData(reqBody);

    if (!req.files || req.files.length !== 5) {
      for (const file of req.files) {
        removeUnusedLocalFile(file.path);
      }
      return {
        status: "fail",
        message: "Exactly five files must be uploaded",
      };
    }

    const uploadPromises = req.files.map((file) =>
      uploadOnCloudinary(file.path)
    );

    const [uploadResults] = await Promise.all([Promise.all(uploadPromises)]);

    // Save Cloudinary upload results
    const cloudinaryUrlStore = uploadResults.map((uploadResult) => ({
      url: uploadResult.secure_url,
      pid: uploadResult.public_id,
    }));

    //Set main image with the post data
    PostData.mainImg = {
      url: cloudinaryUrlStore[0].url,
      pid: cloudinaryUrlStore[0].pid,
    };

    //Set details images with the post details data
    for (let i = 1; i < cloudinaryUrlStore.length; i++) {
      PostDetailsData[`img${i}`] = {
        url: cloudinaryUrlStore[i].url,
        pid: cloudinaryUrlStore[i].pid,
      };
    }

    // Create post data and then create post details data using the id of the post model
    const createPostData = await PostModel.create(PostData);
    PostDetailsData.postID = createPostData._id;
    const createPostDetailsData = await PostDetailsModel.create(
      PostDetailsData
    );

    return {
      status: "success",
      Post: createPostData,
      PostDetails: createPostDetailsData,
    };
  } catch (error) {
    for (const file of req.files) {
      removeUnusedLocalFile(file.path);
    }
    next(error);
  }
};

export const updatePostService = async (req, next) => {
  try {
    const postID = new ObjectID(req.query.postId);
    let reqBody = req.body;
    reqBody.userID = new ObjectID(req.headers.id);
    const { PostData, PostDetailsData } = await mapData(reqBody);

    if (!req.files || req.files.length !== 5) {
      /*Multer begin to upload images one by one untill it faces any error.
      So, if the total input image doesn't met the required image it will get
      into this block and the images which has been uploaded already to local path's ./uploads
      folder will get deleted by `removeUnusedLocalFile` method*/

      for (const file of req.files) {
        removeUnusedLocalFile(file.path);
      }
      return {
        status: "fail",
        message: "Exactly five files must be uploaded",
      };
    }

    const existingDetailsImage = await PostDetailsModel.findOne({
      postID: postID,
    }).exec();

    const existingMainImage = await PostModel.findOne({
      _id: postID,
    }).exec();

    const existingDetailsImageObj = existingDetailsImage.toObject();

    /* Identify keys that match the pattern for image field in database.
    In this scneraio whic is $img1, $img2...*/

    const imageKeys = Object.keys(existingDetailsImageObj).filter((key) =>
      key.startsWith("img")
    );

    /*Fetch existing images from database and then send them to destory function for
    deletion from cloudinary*/
    const destroyPromises = imageKeys.map((key) =>
      destroyOnCloudinary(existingDetailsImageObj[key].pid)
    );

    /*Upload new images to cloudinary*/
    const uploadPromises = req.files.map((file) =>
      uploadOnCloudinary(file.path)
    );

    /*Destructing the results after promise resovles
    here `destroyResults` will have the success message for deleted images.
    `uploadResults` contains all the uploaded image links.
    `destroySingle` contain the success message of the main image deletation from cloudinry*/

    const [destroyResults, uploadResults, destroySingle] = await Promise.all([
      Promise.all(destroyPromises),
      Promise.all(uploadPromises),
      destroyOnCloudinary(existingMainImage.mainImg.pid),
    ]);

    // Save Cloudinary upload results
    const cloudinaryUrlStore = uploadResults.map((uploadResult) => ({
      url: uploadResult.secure_url,
      pid: uploadResult.public_id,
    }));

    // Update PostData with new main image
    PostData.mainImg = {
      url: cloudinaryUrlStore[0].url,
      pid: cloudinaryUrlStore[0].pid,
    };

    //Update PostDetailsData with the new details images
    for (let i = 1; i < cloudinaryUrlStore.length; i++) {
      PostDetailsData[`img${i}`] = {
        url: cloudinaryUrlStore[i].url,
        pid: cloudinaryUrlStore[i].pid,
      };
    }

    //Edited post will need further admin approval this will solve scam issue after posting
    PostData.onReview = true;
    PostData.isApproved = false;

    // Update post data
    const updatePostData = await PostModel.updateOne(
      { _id: postID },
      {
        $set: PostData,
        $inc: { editCount: 1 },
      },
      { new: true }
    );
    PostDetailsData.postID = updatePostData._id;
    const updatePostDetails = await PostDetailsModel.updateOne(
      { postID: postID },
      { $set: PostDetailsData },
      { new: true }
    );

    return {
      status: "success",
      message: "Post updated successfully",
      Post: updatePostData,
      PostDetails: updatePostDetails,
    };
  } catch (error) {
    for (const file of req.files) {
      removeUnusedLocalFile(file.path);
    }
    next(error);
  }
};

export const deletePostService = async (req, next) => {
  const session = await mongoose.startSession();
  try {
    const userID = new ObjectID(req.headers.id);
    const postID = new ObjectID(req.query.postId);

    /*Transaction is used here because the full process is conntected
    with two database collection so if there any issue with any of
    those collection it will revert the collection to initial position again*/

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
    next(error);
  } finally {
    session.endSession();
  }
};

export const deletePostImages = async (req, next) => {
  try {
    const postID = new ObjectID(req.query.postId);
    const pid = req.query.pid;

    // Find the post data
    const postData = await PostModel.findOne({
      _id: postID,
      userID: req.headers.id,
    }).exec();

    if (!postData) {
      return {
        status: "fail",
        message: "No post found",
      };
    }

    // Check if the main image matches the pid
    if (postData.mainImg.pid === pid) {
      const updateResult = await PostModel.updateOne(
        { _id: postID },
        { $unset: { mainImg: "" } },
        { new: true }
      );

      if (updateResult.modifiedCount > 0) {
        destroyOnCloudinary(pid);
        return { status: "success", message: "Main image deleted" };
      } else {
        return {
          status: "fail",
          message: "Failed to delete main image of the post",
        };
      }
    }

    // Find the post details
    const postDetailsData = await PostDetailsModel.findOne({
      postID: postID,
    }).exec();

    if (!postDetailsData) {
      return {
        status: "fail",
        message:
          "Failed to delete image of the post because no post details found",
      };
    }

    // Iterate through the fields to find and unset the image field with the matching pid
    let updateQuery = {};
    for (let key in postDetailsData) {
      if (postDetailsData[key] && postDetailsData[key].pid === pid) {
        updateQuery[key] = "";
      }
    }

    if (Object.keys(updateQuery).length === 0) {
      return { status: "fail", message: "Image not found" };
    }

    // Update the post details with the unset query
    const result = await PostDetailsModel.updateOne(
      { postID: postID },
      { $unset: updateQuery },
      { new: true }
    );

    if (result.modifiedCount > 0) {
      await destroyOnCloudinary(pid);
      return { status: "success", message: "Selected image deleted" };
    } else {
      return { status: "fail", message: "Failed to delete image of the post" };
    }
  } catch (error) {
    next(error);
  }
};

export const postListService = async (req, next) => {
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
    next(error);
  }
};
