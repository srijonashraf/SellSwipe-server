import mongoose from "mongoose";
import PostModel from "../models/PostModel.js";
import {
  destroyOnCloudinary,
  uploadOnCloudinary,
} from "../utility/Cloudinary/Cloudinary.js";
import PostDetailsModel from "./../models/PostDetailsModel.js";
import mapData from "../utility/CreatePost/MapData.js";

const ObjectID = mongoose.Types.ObjectId;

export const createPostService = async (req) => {
  try {
    let reqBody = req.body;
    reqBody.userID = new ObjectID(req.headers.id);
    const { PostData, PostDetailsData } = await mapData(reqBody);

    if (!req.files || req.files.length !== 5) {
      return {
        status: "fail",
        message: "Exactly five files must be uploaded",
      };
    }

    const uploadPromises = req.files.map((file) =>
      uploadOnCloudinary(file.path)
    );

    const [uploadResults] = await Promise.all([Promise.all(uploadPromises)]);

    // Process Cloudinary upload results
    const cloudinaryUrlStore = uploadResults.map((uploadResult) => ({
      url: uploadResult.secure_url,
      pid: uploadResult.public_id,
    }));

    PostData.mainImg = {
      url: cloudinaryUrlStore[0].url,
      pid: cloudinaryUrlStore[0].pid,
    };

    for (let i = 1; i < cloudinaryUrlStore.length; i++) {
      PostDetailsData[`img${i}`] = {
        url: cloudinaryUrlStore[i].url,
        pid: cloudinaryUrlStore[i].pid,
      };
    }

    // Create post data
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
    console.error(error);
    return { status: "fail", data: error.message };
  }
};

export const updatePostService = async (req) => {
  try {
    const postID = new ObjectID(req.query.postId);
    let reqBody = req.body;
    reqBody.userID = new ObjectID(req.headers.id);
    const { PostData, PostDetailsData } = await mapData(reqBody);

    if (!req.files || req.files.length !== 5) {
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
    const destroyPromises = Object.keys(existingDetailsImageObj)
      .slice(0, 4)
      .map((key) => destroyOnCloudinary(existingDetailsImageObj[key].pid));

    const uploadPromises = req.files.map((file) =>
      uploadOnCloudinary(file.path)
    );

    const [destroyResults, uploadResults, destroySingle] = await Promise.all([
      Promise.all(destroyPromises),
      Promise.all(uploadPromises),
      destroyOnCloudinary(existingMainImage.mainImg.pid),
    ]);

    // Process Cloudinary upload results
    const cloudinaryUrlStore = uploadResults.map((uploadResult) => ({
      url: uploadResult.secure_url,
      pid: uploadResult.public_id,
    }));

    // Update PostData and PostDetailsData with new image URLs
    PostData.mainImg = {
      url: cloudinaryUrlStore[0].url,
      pid: cloudinaryUrlStore[0].pid,
    };

    for (let i = 1; i < cloudinaryUrlStore.length; i++) {
      PostDetailsData[`img${i}`] = {
        url: cloudinaryUrlStore[i].url,
        pid: cloudinaryUrlStore[i].pid,
      };
    }

    // Create post data
    const updatePostData = await PostModel.updateOne(
      { _id: postID },
      { $set: PostData },
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
    console.error(error);
    return { status: "fail", data: error.message };
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
