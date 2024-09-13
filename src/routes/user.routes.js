import { Router } from "express";
import {
  changeCurrentUserPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  userRegister,
} from "../controllers/user.controller.js";
import { uploads } from "../middlewares/multer.middleware.js";
import { verfiyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  uploads.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  userRegister
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

//Secured Routes
router.route("/logout").post(verfiyJwt, logoutUser);
router.route("/change-password").post(verfiyJwt, changeCurrentUserPassword);
router.route("/current-user").get(verfiyJwt, getCurrentUser);
router.route("/update-account").patch(verfiyJwt, updateAccountDetails);
router
  .route("/update-avatar")
  .patch(verfiyJwt, uploads.single("avatar"), updateUserAvatar);
router
  .route("/update-coverimage")
  .patch(verfiyJwt, uploads.single("coverImage"), updateUserCoverImage);

router.route("/c/:username").get(verfiyJwt, getUserChannelProfile);
router.route("/watch-history").get(verfiyJwt, getWatchHistory);

export default router;
