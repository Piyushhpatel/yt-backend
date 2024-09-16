import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controllers.js"
import { verfiyJwt } from '../middlewares/auth.middleware.js';


const router = Router();
router.use(verfiyJwt);

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet)
router.route("/:tweetId").delete(deleteTweet);

export default router