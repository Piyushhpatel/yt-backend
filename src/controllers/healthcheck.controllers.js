import {ApiError} from "../utils/AppError.js"
import {ApiResponse} from "../utils/AppResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, "Ok")
    )
})

export { healthcheck }
    