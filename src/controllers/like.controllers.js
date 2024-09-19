import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/AppError.js";
import { ApiResponse } from "../utils/AppResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comments.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if(existingLike) {
    await Like.findOneAndDelete({video: videoId});
    return res.status(200).json(new ApiResponse(200, "Video Unliked"));
  }
  else{
    const like = await Like.create({
        video: videoId,
        likedBy: req.user?._id
    });
    return res.status(200).json(new ApiResponse(200, like, "Video Liked"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if(existingLike) {
    await Like.findOneAndDelete({comment: commentId});
    return res.status(200).json(new ApiResponse(200, "Comment Unliked"));
  }
  else{
    const like = await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    });
    return res.status(200).json(new ApiResponse(200, like, "Comment Liked"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if(existingLike) {
    await Like.findOneAndDelete({tweet: tweetId});
    return res.status(200).json(new ApiResponse(200, "Tweet Unliked"));
  }
  else{
    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    });
    return res.status(200).json(new ApiResponse(200, like, "Tweet Liked"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
                video: {$ne: null}
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
            },
        },
        {
            $project: {
                video: 1,
                likedBy: 1,
            }
        }
    ])

    if(!likedVideos){
        throw new ApiError(500, "Something went wrong, Unable to get liked videos");
    }

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked Videos Fetched Successfully")
    )
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
