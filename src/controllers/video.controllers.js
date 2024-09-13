import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/AppError.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  // Algorithm
  // 

  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  
  const options = {
    page: page,
    limit: limit,
  }


  


});

const publishAVideo = asyncHandler(async (req, res) => {
  //{videoFile, thumbnail, title, description, duration, views, isPublished, owner}
  const { title, description } = req.body;

  if (!title && !description) {
    throw new ApiError(400, "All fields are required");
  }

  const videoFileLocalPath = req.files?.videoFile[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video File is Missing");
  }

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumnail is Missing");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile && !thumbnail) {
    throw new ApiError(
      500,
      "Something went wrong while uploading file on cloudinary"
    );
  }

  const video = await Video.create({
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url,
    title: title,
    description: description,
    duration: videoFile?.duration,
    owner: req.user?._id,
  });

  if (!video) {
    throw new ApiError(
      500,
      "Soemthing went wrong while creating video collection"
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video Published Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Requested video doesn't exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnailLocalPath = req.file?.path;
  
    // Find the video by ID
    const video = await Video.findById(videoId);
  
    if (!video) {
      throw new ApiError(404, "Video doesn't exist");
    }
  
    // Check if the user is the owner
    if (!video.owner.equals(req.user?._id)) {
      throw new ApiError(401, "Unauthorized to update the video");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  
    // Update fields or retain old values
    video.title = title ?? video.title;
    video.description = description ?? video.description;
    video.thumbnail = thumbnail?.url ?? video.thumbnail;
  
    // Save the updated video without validation
    await video.save({ validateBeforeSave: false });
  
    return res.status(200).json(
      new ApiResponse(200, video, "Video updated successfully")
    );
  });
  
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const user = await User.findById(req.user?._id);

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video doesn't exist");
  }

  if (!video?.owner.equals(user?._id)) {
    throw new ApiError(
      401,
      "Unauthorized request only owner can change status"
    );
  }

  const result = await Video.deleteOne({ _id: videoId });

  if (!result) {
    throw new ApiError(500, "Something went wrong unable to delete video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  //Quick Algo
  //Validate Video Id
  //Find the video If not found throw error
  //Check wheater current user is owner or not if not owner throw error
  //if owner update the status

  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video Id Missing");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video doesn't exist");
  }

  if (!video?.owner.equals(req.user?._id)) {
    throw new ApiError(
      401,
      "Unauthorized request only owner can change status"
    );
  }

  (video.isPublished = !video?.isPublished),
    await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Video status toggled successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
