import mongoose from "mongoose"
import {Comment} from "../models/comments.model.js"
import {ApiError} from "../utils/AppError.js"
import {ApiResponse} from "../utils/AppResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video doesn't exist");
    }

    // Setup options for pagination
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    // Create the aggregation pipeline
    const pipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner" // Optional: Use this if you expect one owner per comment
        }
    ];

    // Use aggregatePaginate to paginate the results
    const comments = await Comment.aggregatePaginate(Comment.aggregate(pipeline), options);

    if (!comments) {
        throw new ApiError(500, "Unable to fetch comments");
    }

    const totalPages = comments.totalPages;
    const currentPage = comments.page;
    const hasNextPage = comments.hasNextPage;
    const hasPrevPage = comments.hasPrevPage;
    
    const nextPage = hasNextPage ? `${req.baseUrl}${req.path}?page=${currentPage + 1}&limit=${limit}` : null;
    const prevPage = hasPrevPage ? `${req.baseUrl}${req.path}?page=${currentPage - 1}&limit=${limit}` : null;

    // Create the response with pagination info and comments data
    return res.status(200).json(
        new ApiResponse(200, {
            comments: comments.docs,
            currentPage,
            totalPages,
            hasNextPage,
            hasPrevPage,
            nextPage,
            prevPage,
        }, "Comments fetched successfully")
    );
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {content} = req.body;

    if(!content){
        throw new ApiError(401, "Content field is required");
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(404, "Video not found");
    }

    const user = await User.findById(req.user?._id);
    
    if(!user) {
        throw new ApiError(404, "User doesn't exist");
    }

    const comment = await Comment.create({
        content: content,
        video: videoId,
        owner: req.user?._id
    })

    await comment.save();

    if(!comment) {
        throw new ApiError(500, "Something went wrong, Unable to create comment");
    }

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment created successfully")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    //take comment id and find comment
    //If not exsit throw error
    //Take video id and check if video exist or not
    //Take owner compare with user id
    //Then update
    const {commentId} = req.params;
    const {content} = req.body;

    const comment = await Comment.findById(commentId);

    if(!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const video = await Video.findById(comment?.video);

    if(!video) {
        throw new ApiError(404, "Video doesn't exist");
    }

    if(!comment.owner.equals(req.user?._id)){
        throw new ApiError(402, "Unauthorized to update comment");
    }

    comment.content = content,
    await comment.save({validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment Updated Successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    //take comment id and find comment
    //If not exsit throw error
    //Take video id and check if video exist or not
    //Take owner compare with user id
    //Then delete
    const {commentId} = req.params;

    const comment = await Comment.findById(commentId);

    if(!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const video = await Video.findById(comment?.video);

    if(!video) {
        throw new ApiError(404, "Video doesn't exist");
    }

    if(!comment.owner.equals(req.user?._id)){
        throw new ApiError(402, "Unauthorized to delete comment");
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(
        new ApiError(200, "Comment Deleted Successfully")
    )
})

export { getVideoComments, addComment, updateComment, deleteComment }
