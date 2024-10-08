import mongoose from "mongoose";
import PostModel from "../models/PostModel.js";
import PostDetailsModel from "./../models/PostDetailsModel.js";
import {
  destroyOnCloudinary,
  uploadOnCloudinary,
} from "../utils/CloudinaryUtility.js";
import mapData from "../utils/MappingUtility.js";
import { removeUnusedLocalFile } from "../utils/FileCleanUpUtility.js";
import { inputSanitizer } from "./../middlewares/RequestValidateMiddleware.js";
import { calculatePagination } from "./../utils/PaginationUtility.js";
import FavouriteModel from "../models/FavouriteModel.js";
import {
  NOTIFICATION_ACTIONS,
  REPORT_CATEGORIES,
} from "../constants/Notifications.js";
import { postValidationQuery } from "./../utils/PostValidationUtility.js";
import {
  sendNotificationToAdmin,
  sendNotificationToUser,
} from "../utils/NotificationsUtility.js";
import { postStatus } from "../constants/Types.js";

export const createPostService = async (req, next) => {
  try {
    let reqBody = req.body;
    reqBody.userID = req.headers.id;
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
      uploadOnCloudinary(file.path, req.headers.id)
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
    const postID = req.params.id;
    let reqBody = req.body;
    reqBody.userID = req.headers.id;
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

    const postOwner = await PostModel.findOne({
      userID: req.headers.id,
    }).exec();
    if (!postOwner) {
      for (const file of req.files) {
        removeUnusedLocalFile(file.path);
      }
      return {
        status: "fail",
        message: "Post owner not found",
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
      uploadOnCloudinary(file.path, req.headers.id)
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

export const detailsPostService = async (req, next) => {
  try {
    // Convert req.params.id and req.query.nid to ObjectId
    const postID = mongoose.Types.ObjectId.createFromHexString(req.params.id);

    // Increment the view count for the post
    await PostModel.updateOne({ _id: postID }, { $inc: { viewsCount: 1 } });

    // Create post validation query object
    const postValidation = postValidationQuery({ _id: postID });

    // Perform aggregation to get post details
    const response = await PostModel.aggregate([
      {
        $match: postValidation,
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
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "user.accountStatus": { $in: ["Validate", "Warning"] },
        },
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
        $lookup: {
          from: "divisions",
          localField: "divisionID",
          foreignField: "_id",
          as: "division",
        },
      },
      {
        $unwind: {
          path: "$division",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "districtID",
          foreignField: "_id",
          as: "district",
        },
      },
      {
        $unwind: {
          path: "$district",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "areas",
          localField: "areaID",
          foreignField: "_id",
          as: "area",
        },
      },
      {
        $unwind: {
          path: "$area",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "postdetails.brandID",
          foreignField: "_id",
          as: "postdetails.brand",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "postdetails.categoryID",
          foreignField: "_id",
          as: "postdetails.category",
        },
      },
      {
        $unwind: {
          path: "$postdetails.brand",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$postdetails.category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          onReview: 0,
          isApproved: 0,
          isDeclined: 0,
          approvedBy: 0,
          declinedBy: 0,
          isActive: 0,
          isDeleted: 0,
          reportCount: 0,
          reportedBy: 0,
          feedback: 0,
          userID: 0,
          divisionID: 0,
          districtID: 0,
          areaID: 0,
          "user.email": 0,
          "user.role": 0,
          "user.avatar.pid": 0,
          "user.password": 0,
          "user.nidSubmitted": 0,
          "user.nidVerified": 0,
          "user.emailVerified": 0,
          "user.accountStatus": 0,
          "user.sessionId": 0,
          "user.loginAttempt": 0,
          "user.lastLogin": 0,
          "user.limitedLogin": 0,
          "user.lastRefresh": 0,
          "user.address": 0,
          "user.nidNumber": 0,
          "user.nidBack": 0,
          "user.nidFront": 0,
          "postdetails.brandID": 0,
          "postdetails.modelID": 0,
          "postdetails.categoryID": 0,
          "postdetails.createdAt": 0,
          "postdetails.updatedAt": 0,
          "postdetails.brand.createdAt": 0,
          "postdetails.brand.updatedAt": 0,
          "postdetails.brand.models.createdAt": 0,
          "postdetails.brand.models.updatedAt": 0,
          "postdetails.category.createdAt": 0,
          "postdetails.category.updatedAt": 0,
          "postdetails.category.subCategories.createdAt": 0,
          "postdetails.category.subCategories.updatedAt": 0,
          "division.createdAt": 0,
          "division.updatedAt": 0,
          "district.createdAt": 0,
          "district.updatedAt": 0,
          "area.createdAt": 0,
          "area.updatedAt": 0,
        },
      },
    ]);

    if (!response || response.length === 0) {
      return { status: "fail", message: "Post not found" };
    }

    return {
      status: "success",
      data: response[0],
    };
  } catch (error) {
    next(error);
  }
};

export const deletePostByUserService = async (req, next) => {
  const session = await mongoose.startSession();
  try {
    // Start transaction
    session.startTransaction();
    const userID = req.headers.id;
    const postID = req.params.id;

    // Delete post
    const post = await PostModel.deleteOne({
      _id: postID,
      userID: userID,
    }).session(session);

    if (post.deletedCount !== 1) {
      await session.abortTransaction(); // Abort transaction
      return { status: "fail", message: "Failed to delete post" };
    }

    // Delete post details
    const postDetails = await PostDetailsModel.deleteOne({
      postID: postID,
    }).session(session);

    if (postDetails.deletedCount !== 1) {
      await session.abortTransaction(); // Abort transaction if postDetails fails
      return { status: "fail", message: "Failed to delete post details" };
    }

    // Commit transaction
    await session.commitTransaction();
    return { status: "success", message: "Post is deleted" };
  } catch (error) {
    // Check if the transaction was started before attempting to abort
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    next(error);
  } finally {
    // End session only once in the finally block
    await session.endSession();
  }
};

export const deletePostImagesService = async (req, next) => {
  try {
    const postID = req.params.id;
    const pid = req.query.pid;

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

export const getAllPostsService = async (req, next) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });
    const postValidation = postValidationQuery();
    const userValidation = {
      "user.accountStatus": { $in: ["Validate", "Warning"] },
    };
    const validation = { ...postValidation, ...userValidation };

    const data = await PostModel.aggregate([
      {
        $sort: {
          [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1,
        },
      },
      { $limit: pagination.limit },
      { $skip: pagination.skip },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "divisions",
          localField: "divisionID",
          foreignField: "_id",
          as: "division",
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "districtID",
          foreignField: "_id",
          as: "district",
        },
      },
      {
        $lookup: {
          from: "areas",
          localField: "areaID",
          foreignField: "_id",
          as: "area",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $unwind: "$division",
      },
      {
        $unwind: "$district",
      },
      {
        $unwind: "$area",
      },
      {
        $match: validation,
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: "$user._id",
            name: "$user.name",
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
          "division._id": 1,
          "division.divisionName": 1,
          "district._id": 1,
          "district.districtName": 1,
          "area._id": 1,
          "area.areaName": 1,
          address: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    const totalPosts = await PostModel.countDocuments(postValidation);

    return {
      status: "success",
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalPosts / pagination.limit),
      },
      data: data,
    };
  } catch (error) {
    next(error);
  }
};

export const ownPostsService = async (req, next) => {
  try {
    let postValidation;
    const type = req.query.type;

    if (type === "pending") {
      postValidation = postValidationQuery({
        userID: req.headers.id,
        onReview: true,
        isApproved: false,
        isDeclined: false,
      });
    } else {
      postValidation = postValidationQuery({ userID: req.headers.id });
    }

    const posts = await PostModel.find(postValidation);

    if (posts.length === 0) {
      return { status: "success", message: "No post found" };
    }

    return { status: "success", data: posts };
  } catch (error) {
    next(error);
  }
};

export const reportPostService = async (req, next) => {
  try {
    const postID = req.params.id;
    const reqBody = req.body;

    inputSanitizer(reqBody);

    const { reportCause } = reqBody;

    const reportResponse = await PostModel.findOneAndUpdate(
      {
        _id: postID,
        "reportedBy.userId": { $nin: [req.headers.id] },
      },
      {
        $addToSet: {
          reportedBy: {
            userId: req.headers.id,
            role: req.headers.role,
            causeOfReport: reportCause,
          },
        },
        $inc: { reportCount: 1 },
      },
      { new: true }
    );

    if (!reportResponse) {
      return {
        stutus: "fail",
        message: "A report is already pending or failed to report the post",
      };
    }

    await sendNotificationToAdmin({
      action: NOTIFICATION_ACTIONS.REPORT_TO_ADMIN,
      title: REPORT_CATEGORIES.FALSE_INFORMATION,
      description: reportCause,
      postId: postID,
      senderId: req.headers.id,
    });

    return {
      status: "success",
      message: "Report has been submitted successfully.",
    };
  } catch (error) {
    next(error);
  }
};

export const reportedPostListService = async (req, next) => {
  try {
    const data = await PostModel.find({
      "reportedBy.userId": { $in: [req.headers.id] },
    })
      .sort({ "reportedBy.createdAt": -1 })
      .select("title price discount discountPrice");
    if (!data) {
      return {
        stutus: "fail",
        message: "Failed to load report post list",
      };
    }

    return {
      status: "success",
      data: data,
    };
  } catch (error) {
    next(error);
  }
};

export const favouritePostService = async (req, next) => {
  try {
    const postID = req.params.id;
    const userID = req.headers.id;

    const favouriteResponse = await FavouriteModel.findOneAndUpdate(
      { postID, userID },
      {
        $set: { postID, userID },
      },
      {
        new: true,
        upsert: true,
      }
    );

    if (!favouriteResponse) {
      return {
        status: "fail",
        message: "Post or user not found",
      };
    }

    return {
      status: "success",
      message: "Post added to favourite",
    };
  } catch (error) {
    next(error);
  }
};

export const favouritePostListService = async (req, next) => {
  try {
    const result = await FavouriteModel.find({ userID: req.headers.id });

    if (!result) {
      return {
        status: "fail",
        message: "Post or user not found",
      };
    }

    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    next(error);
  }
};

export const updatePostStatusService = async (req, next) => {
  try {
    let query = {};
    const status = req.query.status;
    const postID = req.params.id;
    const userID = req.headers.id;

    if (status === postStatus.ACTIVE_POST) {
      query = {
        $set: { isActive: true },
      };
    } else {
      query = {
        $set: { isActive: false },
      };
    }

    const result = await PostModel.findOneAndUpdate(
      { _id: postID, userID: userID },
      query
    );

    if (!result) {
      return {
        status: "fail",
        message: "Post or user not found",
      };
    }

    return {
      status: "success",
      message: `Your post is now ${status}`,
    };
  } catch (error) {
    next(error);
  }
};

export const getSimilarPostsService = async (req, next) => {
  try {
    const { categoryID, brandID } = req.body;

    const postValidation = {
      "post.isApproved": true,
      "post.isActive": true,
      "post.onReview": false,
      "post.isDeclined": false,
      "post.isDeleted": false,
    };

    //We will fetch some random data so that each time it doesn't show the same similar posts
    const data = await PostDetailsModel.aggregate([
      {
        $match: {
          categoryID: mongoose.Types.ObjectId.createFromHexString(categoryID),
          brandID: mongoose.Types.ObjectId.createFromHexString(brandID),
        },
      },
      { $sample: { size: 10 } },
      {
        $lookup: {
          from: "posts",
          localField: "postID",
          foreignField: "_id",
          as: "post",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "post.userID",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$post",
        },
      },
      {
        $unwind: {
          path: "$user",
        },
      },
      {
        $match: postValidation,
      },
      {
        $project: {
          "post.title": 1,
          "post.price": 1,
          "post.discount": 1,
          "post.discountPrice": 1,
          "post.mainImg": 1,
          "post.stock": 1,
          "post.viewsCount": 1,
          "post.createdAt": 1,
          "post.updatedAt": 1,
          "user._id": 1,
          "user.name": 1,
        },
      },
    ]);

    if (!data) {
      return { status: "fail", message: "No post found" };
    }
    return { status: "success", total: data.length, data: data };
  } catch (error) {
    next(error);
  }
};

//Post Search and Filter

/**
 * postSearchWithFiltersService - A service to search posts based on keyword and apply various filters.
 *
 * This function performs a complex search on the PostModel collection by combining keyword-based search
 * with multiple filtering options. It joins data from related collections (postdetails, divisions, districts,
 * and areas), applies filters, and returns the matching posts. The following filters can be applied:
 *
 * - Keyword search on title, post description, or post keywords.
 * - Division, district, and area filters.
 * - Price range filters, including both regular and discounted prices.
 * - Category, brand, model filters
 */
export const postSearchWithFiltersService = async (req, next) => {
  try {
    let { keyword, page, limit, sortBy, sortOrder } = req.query;
    let keyWordRegex = { $regex: keyword, $options: "i" };
    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    /**
     * The postdetails, division, district, area are from different collections,
     * so we have to join them first (using $lookup) and then unwind them
     * to properly project them in the response JSON.
     */
    const reqBody = req.body;
    inputSanitizer(reqBody);
    const {
      divisionId,
      districtId,
      areaId,
      brandId,
      categoryId,
      modelId,
      minPrice,
      maxPrice,
    } = reqBody;

    // Query to check post validation
    const postValidation = postValidationQuery();

    //Query to check user validation
    const userValidation = {
      "user.accountStatus": { $in: ["Validate", "Warning"] },
    };

    //Math Title and Description
    const matchTitleDescription = {
      $or: [
        { title: keyWordRegex },
        { "postdetails.description": keyWordRegex },
        { "postdetails.keyword": keyWordRegex },
      ],
    };
    // Filter for Post Model
    const postFilterQuery = {};

    if (divisionId)
      postFilterQuery.divisionID =
        mongoose.Types.ObjectId.createFromHexString(divisionId);
    if (districtId)
      postFilterQuery.districtID =
        mongoose.Types.ObjectId.createFromHexString(districtId);
    if (areaId)
      postFilterQuery.areaID =
        mongoose.Types.ObjectId.createFromHexString(areaId);

    // Price filter based on price and discountPrice
    const priceFilter = {
      $or: [
        {
          $and: [
            { discount: true },
            {
              discountPrice: {
                $gte: parseInt(minPrice) || 0,
                $lte: parseInt(maxPrice) || Infinity,
              },
            },
          ],
        },
        {
          price: {
            $gte: parseInt(minPrice) || 0,
            $lte: parseInt(maxPrice) || Infinity,
          },
        },
      ],
    };

    // Add the priceFilter to the main query
    postFilterQuery.$and = [priceFilter];

    // Filter for postdetails collection
    const postDetailsFilterQuery = {};
    if (brandId)
      postDetailsFilterQuery["postdetails.brandID"] =
        mongoose.Types.ObjectId.createFromHexString(brandId);
    if (categoryId)
      postDetailsFilterQuery["postdetails.categoryID"] =
        mongoose.Types.ObjectId.createFromHexString(categoryId);
    if (modelId)
      postDetailsFilterQuery["postdetails.modelID"] =
        mongoose.Types.ObjectId.createFromHexString(modelId);

    const data = await PostModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "user",
        },
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
        $lookup: {
          from: "divisions",
          localField: "divisionID",
          foreignField: "_id",
          as: "division",
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "districtID",
          foreignField: "_id",
          as: "district",
        },
      },
      {
        $lookup: {
          from: "areas",
          localField: "areaID",
          foreignField: "_id",
          as: "area",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$postdetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$division",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$district",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$area",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $and: [
            postValidation,
            userValidation,
            matchTitleDescription,
            postDetailsFilterQuery,
            postFilterQuery,
          ],
        },
      },
      {
        $sort: {
          [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1,
        },
      },
      {
        $facet: {
          totalCount: [
            {
              $count: "count",
            },
          ],
          paginatedResults: [
            { $limit: pagination.limit },
            { $skip: pagination.skip },
            {
              $project: {
                _id: 1,
                user: {
                  _id: "$user._id",
                  name: "$user.name",
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
                "division._id": 1,
                "division.divisionName": 1,
                "district._id": 1,
                "district.districtName": 1,
                "area._id": 1,
                "area.areaName": 1,
                address: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ],
        },
      },
    ]);

    if (!data || data.length === 0) {
      return { status: "fail", message: "No data found" };
    }
    const { totalCount, paginatedResults } = data[0];
    const totalItems = totalCount.length > 0 ? totalCount[0].count : 0;

    return {
      status: "success",
      total: totalItems,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit),
      },
      data: paginatedResults,
    };
  } catch (error) {
    next(error);
  }
};

//___Admin___//
export const getReviewPostListService = async (req, next) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    // Build query for posts on review and not approved
    const query = postValidationQuery({ onReview: true, isApproved: false });

    // Count the total number of documents matching the criteria
    const totalCount = await PostModel.countDocuments(query);

    // Fetch paginated and sorted posts
    const data = await PostModel.find(query)
      .sort({ [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1 })
      .limit(pagination.limit)
      .skip(pagination.skip);

    if (!data) {
      return { status: "fail", message: "Failed to load review post list" };
    }

    return {
      status: "success",
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalCount / pagination.limit),
      },
      data: data,
    };
  } catch (error) {
    next(error);
  }
};

export const getApprovedPostListService = async (req, next) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    // Only SuperAdmin can view all approved post, admin will view their own approved post only
    let query = postValidationQuery();

    if (req.headers.role !== "SuperAdmin") {
      query["approvedBy.userId"] = req.headers.id;
    }

    const totalCount = await PostModel.countDocuments(query);

    const data = await PostModel.find(query)
      .sort({ [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1 })
      .limit(pagination.limit)
      .skip(pagination.skip);

    if (!data) {
      return { status: "fail", message: "Failed to load approved post list" };
    }

    return {
      status: "success",
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalCount / pagination.limit),
      },
      data: data,
    };
  } catch (error) {
    next(error);
  }
};

export const getDeclinedPostListService = async (req, next) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    // Only SuperAdmin can view all canceled post, admin will view their own canceled post only

    let query = postValidationQuery({ isApproved: false, isDeclined: true });

    if (req.headers.role !== "SuperAdmin") {
      query["declinedBy.userId"] = req.headers.id;
    }

    const totalCount = await PostModel.countDocuments(query);

    const data = await PostModel.find(query)
      .sort({ [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1 })
      .limit(pagination.limit)
      .skip(pagination.skip);

    if (!data) {
      return { status: "fail", message: "Failed to load declined post list" };
    }

    return {
      status: "success",
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalCount / pagination.limit),
      },
      data: data,
    };
  } catch (error) {
    next(error);
  }
};

export const getReportedPostListService = async (req, next) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    const query = {
      reportCount: { $gte: 1 },
    };

    const totalCount = await PostModel.countDocuments(query);

    const data = await PostModel.find(query)
      .sort({ [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1 })
      .limit(pagination.limit)
      .skip(pagination.skip);

    if (!data) {
      return { status: "fail", message: "Failed to load reported post list" };
    }

    return {
      status: "success",
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalCount / pagination.limit),
      },
      data: data,
    };
  } catch (error) {
    next(error);
  }
};

export const withdrawReportService = async (req, next) => {
  try {
    const { postId, id } = req.params; //id is report id
    const data = await PostModel.findOneAndUpdate(
      { _id: postId, "reportedBy._id": id },
      {
        $pull: { reportedBy: { _id: id } },
        $inc: { reportCount: -1 },
      },
      {
        new: true,
      }
    );

    if (!data) {
      return { status: "fail", message: "Failed to withdraw report" };
    }

    // Manually ensure reportCount does not go below zero
    if (data.reportCount < 0) {
      data.reportCount = 0;
      await data.save();
    }

    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const approvePostService = async (req, next) => {
  try {
    /*req.body should receive an array like this [{
            "postId": [
                "66a3de66e505fd46ea7c2435",
                "66a3de66e505fd46ea7c2435"
            ]
            or
            "postId": [
                "66a3de66e505fd46ea7c2435"
            ]
              */

    const postId = req.body.postId;
    const { id, name, role } = req.headers;

    inputSanitizer(postId);

    const data = await PostModel.updateMany(
      { _id: { $in: postId } },
      {
        $set: {
          isDeclined: false,
          onReview: false,
          declinedBy: null,
          isApproved: true,
          approvedBy: { userId: id, name: name, role: role },
        },
      }
    );
    if (data.modifiedCount === 0) {
      return { status: "fail", message: "Failed to approve post" };
    }
    return { status: "success", data: [], message: "Posts Approved" };
  } catch (error) {
    next(error);
  }
};

export const declinePostService = async (req, next) => {
  try {
    /*req.body should receive an array like this [{
            "postId": [
                "66a3de66e505fd46ea7c2435",
                "66a3de66e505fd46ea7c2435"
            ]
            or
            "postId": [
                "66a3de66e505fd46ea7c2435"
            ]
              */

    const postId = req.body.postId;
    const { id, name, role } = req.headers;

    inputSanitizer(postId);

    const data = await PostModel.updateMany(
      { _id: { $in: postId } },
      {
        $set: {
          isApproved: false,
          onReview: false,
          approvedBy: null,
          isDeclined: true,
          declinedBy: { userId: id, name: name, role: role },
        },
      }
    );

    if (data.modifiedCount === 0) {
      return { status: "fail", message: "Failed to decline post" };
    }
    return { status: "success", data: [], message: "Posts Declined" };
  } catch (error) {
    next(error);
  }
};

export const deletePostByAdminService = async (req, next) => {
  const session = await mongoose.startSession();
  try {
    const postID = req.params.postId;
    await sendNotificationToUser({
      action: NOTIFICATION_ACTIONS.DELETE_POST,
      postId: postID,
      senderId: req.headers.id,
    });

    // Start the transaction
    session.startTransaction();

    // Delete post
    const post = await PostModel.deleteOne({ _id: postID }).session(session);

    if (!post) {
      return { status: "fail", message: "Post not found" };
    }

    if (post.deletedCount !== 1) {
      // If post delete fails, abort transaction
      await session.abortTransaction();
      return { status: "fail", message: "Failed to delete post by admin" };
    }

    // Delete post details
    const postDetails = await PostDetailsModel.deleteOne({
      postID: postID,
    }).session(session);

    if (postDetails.deletedCount !== 1) {
      // If post details delete fails, abort transaction
      await session.abortTransaction();
      return {
        status: "fail",
        message: "Failed to delete post details by admin",
      };
    }

    // If all deletes succeeded, commit the transaction
    await session.commitTransaction();

    return { status: "success", message: "Post deleted by admin successfully" };
  } catch (error) {
    // Abort the transaction on any error
    await session.abortTransaction();
    next(error);
    return { status: "fail", message: "Something went wrong" };
  } finally {
    // Ensure session is ended only once in the `finally` block
    await session.endSession();
  }
};

export const sendFeedbackService = async (req, next) => {
  try {
    const postID = req.params.postId;
    const reqBody = req.body;

    inputSanitizer(reqBody);

    const data = await PostModel.findOneAndUpdate(
      { _id: postID },
      {
        $addToSet: {
          feedback: {
            id: req.headers.id,
            role: req.headers.role,
            comment: reqBody.feedback,
          },
        },
      },
      { new: true }
    );

    if (!data) {
      return { status: "fail", message: "Failed to send feedback" };
    }
    await sendNotificationToUser({
      action: NOTIFICATION_ACTIONS.FEEDBACK_POST,
      postId: postID,
      senderId: req.headers.id,
    });

    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};
