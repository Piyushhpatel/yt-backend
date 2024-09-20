import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/AppError.js"
import {ApiResponse} from "../utils/AppResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const subscription = await Subscription.findOneAndDelete({
        subscriber: req.user?._id,
        channel: channelId,
    })

    if(subscription) {
       return res.status(200).json(
        new ApiResponse(200, "Channel Unsubscribed Successfully")
       )
    }
    else{
        const subscription = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId,
        })

        if(!subscription) {
            throw new ApiError(401, "Unable to subscribe");
        }

        return res.status(200).json(
            new ApiResponse(200, "Channel Subscribed")
        )
    }
})

// controller to return subscriber list of a channel
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: channelId,
            }
        },
    ]);

    if(!subscribers) {
        throw new ApiError(500, "Unable to fetch the subscriber list");
    }

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscriber Fetched Successfully")
    )
})

// controller to return channel list to which user has subscribed
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: subscriberId,
            }
        },
    ]);

    if(!channels) {
        throw new ApiError(500, "Unable to fetch the subscriber list");
    }

    return res.status(200).json(
        new ApiResponse(200, channels, "Channels Fetched Successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}