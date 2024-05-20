import mongoose from "mongoose";
import PostModel from "../models/PostModel.js";
import { uploadOnCloudinary } from "../utility/Cloudinary.js";
import PostDetailsModel from "./../models/PostDetailsModel.js";

const ObjectID = mongoose.Types.ObjectId;

// Function to map request data to PostData and PostDetailsData
const mapData = (data) => {
  const {
    userID,
    title,
    price,
    discountPrice,
    discountPercentage,
    stock,
    divisionID,
    districtID,
    areaID,
    address,
    otherPhone,
    description,
    size,
    color,
    authenticity,
    condition,
    usedMonths,
    brandID,
    modelID,
    categoryID,
    keyword,
  } = data;

  return {
    PostData: {
      userID,
      title,
      price,
      discountPrice,
      discountPercentage,
      stock,
      divisionID,
      districtID,
      areaID,
      address,
      otherPhone,
    },

    PostDetailsData: {
      description,
      size,
      color,
      authenticity,
      condition,
      usedMonths,
      brandID,
      modelID,
      categoryID,
      keyword,
    },
  };
};

// Function to calculate discount percentage
const calculateDiscountPercentage = (price, discountPrice) => {
  return ((price - discountPrice) / price) * 100;
};

// Function to calculate discount price
const calculateDiscountPrice = (price, discountPercentage) => {
  return price - (price * discountPercentage) / 100;
};

export const CreatePostService = async (req) => {
  try {
    let reqBody = req.body;
    reqBody.userID = new ObjectID(req.headers.id);
    const { PostData, PostDetailsData } = mapData(reqBody);

    // Calculate discount percentage if discountPrice is provided
    if (PostData.discountPrice) {
      PostData.discount = true;
      PostData.discountPercentage = calculateDiscountPercentage(
        PostData.price,
        PostData.discountPrice
      );
    }

    // Calculate discountPrice if discountPercentage is provided
    if (PostData.discountPercentage) {
      PostData.discount = true;
      PostData.discountPrice = calculateDiscountPrice(
        PostData.price,
        PostData.discountPercentage
      );
    }

    //If file not found in req then return fail
    if (!req.files) {
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

    PostData.mainImg = cloudinaryUrls[0]; //First image is the main image / display image

    // Update PostDetailsData with image URLs and postID
    for (let i = 1; i <= 5 && i < cloudinaryUrls.length; i++) {
      PostDetailsData[`img${i}`] = cloudinaryUrls[i];
    }

    if (cloudinaryUrls.length > 0) {
      // Create post data
      const createdPostData = await PostModel.create(PostData);

      // Create post details data
      PostDetailsData.postID = createdPostData._id;
      const createdPostDetailsData = await PostDetailsModel.create(
        PostDetailsData
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
    } else {
      return {
        status: "fail",
        message: "Failed to post your ad because of cloudinary upload",
      };
    }
  } catch (error) {
    console.log(error);
    return { status: "fail", data: error };
  }
};

//ToDo: User will be able to delete specific image of the post, maximum 5 images are allowed to upload.

export const PostListService = async (req) => {
  try {
    const data = await PostModel.aggregate([
      {
        $match: {
          isApproved: true,
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
          title:1,
          mainImg: 1,
          price: 1,
          discount:1,
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
