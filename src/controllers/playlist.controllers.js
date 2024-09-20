import mongoose, {isValidObjectId} from "mongoose";
import {Playlist} from "../models/playlist.model.js";
import {ApiError} from "../utils/AppError.js";
import {ApiResponse} from "../utils/AppResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {Video} from "../models/video.model.js";


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description='No Description'} = req.body
    
    if(!name) {
        throw new ApiError(401, "name of playlist is required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    })

    if(!playlist) {
        throw new ApiError(500, "Unalbe to create the playlist");
    }

    return res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                foreignField: "_id",
                localField: "videos",
                as: "videos"
            }
        }
    ])

    if(!playlists) {
        throw new ApiError(404, "No playlist by user exist");
    }

    return res.status(200).json(
        new ApiResponse(200, playlists, "Playlists fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                foreignField: "_id",
                localField: "videos",
                as: "videos"
            }
        }
    ])

    if(!playlist){
        throw new ApiError(404, "Playlist Not Found");
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(404, "Playlist doesn't exist");
    }

    if(!playlist.owner.equals(req.user?._id)){
        throw new ApiError(402, "Only owner can add video to playlist");
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(404, "Video doesn't exist");
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video is already in the playlist");
    }
    
    playlist.videos.push(videoId);
    await playlist.save({validateBeforeSave: false});

    return res.status(200).json(
        new ApiResponse(200, "Video added successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(404, "Playlist doesn't exist");
    }

    if(!playlist.owner.equals(req.user?._id)){
        throw new ApiError(402, "Only owner can add video to playlist");
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(404, "Video doesn't exist");
    }

    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video is not in the playlist");
    }
    
    playlist.videos = playlist.videos.filter(id => !id.equals(videoId));
    await playlist.save({validateBeforeSave: false});

    return res.status(200).json(
        new ApiResponse(200, "Video Removed successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if(!deletePlaylist){
        throw new ApiError(500, "Error in deleting the playlist");
    }

    return res.status(200).json(
        new ApiResponse(200, "Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if(!playlist.owner.equals(req.user?._id)){
        throw new ApiError(401, "Unauthorized to update the playlist");
    }

    playlist.name = name || playlist.name;
    playlist.description = description || playlist.description;
    await playlist.save({validateBeforeSave: false});

    return res.status(200).json(
        new ApiResponse(200, "Playlist updated Sucessfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
