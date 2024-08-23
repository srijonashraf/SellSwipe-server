import mongoose from "mongoose";
import PostModel from "../models/PostModel.js";
import {
  destroyOnCloudinary,
  uploadOnCloudinary,
} from "../utils/CloudinaryUtility.js";
import PostDetailsModel from "./../models/PostDetailsModel.js";
import mapData from "../utils/MappingUtility.js";
import { removeUnusedLocalFile } from "../utils/FileCleanUpUtility.js";
import { inputSanitizer } from "./../middlewares/RequestValidateMiddleware.js";
import { calculatePagination } from "./../utils/PaginationUtility.js";

const ObjectID = mongoose.Types.ObjectId;

export const getPostByUserService = async (req, next) => {
  try {
    const userId = req.headers.id;
    const posts = await PostModel.find({
      userID: userId,
      onReview: false,
      isApproved: true,
      isDeleted: false,
    });

    if (posts.length === 0) {
      return { status: "success", message: "No post found" };
    }

    return { status: "success", data: posts };
  } catch (error) {
    next(error);
  }
};

export const getPendingPostByUserService = async (req, next) => {
  try {
    const userId = req.headers.id;
    const posts = await PostModel.find({
      userID: userId,
      onReview: true,
      isApproved: false,
      isDeleted: false,
    });

    if (posts.length === 0) {
      return { status: "success", message: "No post found" };
    }

    return { status: "success", data: posts };
  } catch (error) {
    next(error);
  }
};

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
    const postID = new ObjectID(req.params.id);
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
    const postID = req.params.id;

    //Increment the view count to the post and show details
    await PostModel.updateOne({ _id: postID }, { $inc: { viewsCount: 1 } });

    const response = await PostModel.aggregate([
      {
        $match: {
          _id: new ObjectID(postID),
          onReview: false,
          isApproved: true,
          isDeclined: false,
          isActive: true,
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
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
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
          path: "$postdetails",
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
      // No need to unwind brand and category separately; they're inside postdetails
      {
        $project: {
          onReview: 0,
          isApproved: 0,
          isDeclined: 0,
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
          "user.createdAt": 0,
          "user.updatedAt": 0,
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
      data: response,
    };
  } catch (error) {
    next(error);
  }
};

export const deletePostService = async (req, next) => {
  const session = await mongoose.startSession();
  try {
    const userID = new ObjectID(req.headers.id);
    const postID = new ObjectID(req.params.id);

    /* Transaction is used here because the full process is connected
    with two database collections so if there is any issue with any of
    those collections, it will revert the collections to the initial state */

    session.startTransaction(); // Start transaction

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
    // Abort transaction on any error
    await session.abortTransaction();
    next(error);
  } finally {
    // End session only once in the finally block
    await session.endSession();
  }
};

export const deletePostImagesService = async (req, next) => {
  try {
    const postID = new ObjectID(req.params.id);
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
    const data = await PostModel.aggregate([
      {
        $match: {
          isApproved: true,
          isActive: true,
          isDeleted: false,
          onReview: false,
          isDeclined: false,
        },
      },
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
        $match: {
          "user.accountStatus": { $in: ["Validate", "Warning"] },
        },
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

    const totalPosts = await PostModel.countDocuments({
      isApproved: true,
      isActive: true,
      isDeleted: false,
      onReview: false,
      isDeclined: false,
    });

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

export const getSimilarPostsService = async (req, next) => {
  try {
    const { categoryID, brandID } = req.body;

    const postValidationQuery = {
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
          categoryID: new ObjectID(categoryID),
          brandID: new ObjectID(brandID),
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
        $match: postValidationQuery,
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
     * The postdetails, division, district, area are separate collections,
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
    const postValidationQuery = {
      isApproved: true,
      isActive: true,
      onReview: false,
      isDeclined: false,
      isDeleted: false,
    };

    // Filter for Post Model
    const postFilterQuery = {};

    if (divisionId) postFilterQuery.divisionID = new ObjectID(divisionId);
    if (districtId) postFilterQuery.districtID = new ObjectID(districtId);
    if (areaId) postFilterQuery.areaID = new ObjectID(areaId);

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
    const postDetailsFilter = {};
    if (brandId)
      postDetailsFilter["postdetails.brandID"] = new ObjectID(brandId);
    if (categoryId)
      postDetailsFilter["postdetails.categoryID"] = new ObjectID(categoryId);
    if (modelId)
      postDetailsFilter["postdetails.modelID"] = new ObjectID(modelId);

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
            postValidationQuery,
            {
              $or: [
                { title: keyWordRegex },
                { "postdetails.description": keyWordRegex },
                { "postdetails.keyword": keyWordRegex },
              ],
            },
            postDetailsFilter,
            {
              "user.accountStatus": { $in: ["Validate", "Warning"] }, // Ensure the user has a valid account status
            },
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
