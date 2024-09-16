import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/AppError.js"
import {ApiResponse} from "../utils/AppResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body;

    if(!content) {
        throw new ApiError(400, "Content is required");
    }

    const user = await User.findById(req.user?._id);
    
    if(!user){
        throw new ApiError(400, "User doesn't exist, Unauthorized to tweet");
    }

    const tweet = await Tweet.create({
        owner: req.user?._id,
        content: content
    })

    const result = await tweet.save();

    if(!result) {
        throw new ApiError(500, "Unable to create tweet");
    }

    return res.status(201).json(
        new ApiResponse(201, result, "Tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const result = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            }
        },
    ]);

    if (result.length === 0) {
        return res.status(404).json(
            new ApiResponse(404, null, "Tweets not found")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, result, "All tweets fetched successfully")
    );
})

const updateTweet = asyncHandler(async (req, res) => {
    const {content} = req.body;
    const {tweetId} = req.params;

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError("Tweet doesn't exist");
    }

    if(!tweet.owner.equals(req.user?._id)){
        throw new ApiError(401, "Unauthorized to change the content");
    }

    tweet.content = content;
    await tweet.save({validateBeforeSave: false});

    return res.status(200).json(
        new ApiResponse(200, "Tweet Update Successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError("Tweet doesn't exist");
    }

    if(!tweet.owner.equals(req.user?._id)){
        throw new ApiError(401, "Unauthorized to change the content");
    }

    const result = await Tweet.deleteOne(new mongoose.Types.ObjectId(tweetId));

    if(!result){
        throw new ApiError(500, "Unable to delete tweet");
    }
    
    return res.status(200).json(
        new ApiResponse(200, "Tweet Deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
