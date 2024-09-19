import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {User} from "../models/user.model.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/AppError.js"
import {ApiResponse} from "../utils/AppResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const stats = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id),
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers",
                },
                videoCount: {
                    $size: "$videos",
                },
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                videoCount: 1
            }
        }
    ]);

    if(!stats){
        throw new ApiError(404, "Channel Not Found");
    }

    return res.status(200).json(
        new ApiResponse(200, stats[0], "Channel Fetched Succesfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({owner: req.user?._id});

    if(!videos) {
        throw new ApiError(404, "Videos created by user not found");
    }

    return res.status(200).json(
        new ApiResponse(200, videos, "Video Fethched Successfully")
    )
})

export { getChannelStats, getChannelVideos }