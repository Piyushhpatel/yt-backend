import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controllers.js";

import {verfiyJwt} from "../middlewares/auth.middleware.js";
import {uploads} from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verfiyJwt); // Apply verifyJWT middleware to all routes in this file

router.route("/").get(getAllVideos)

router.route("/publish-video").post(
        uploads.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(uploads.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;