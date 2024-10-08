import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        subscriber: {
            type: mongoose.Schema.Types.ObjectId, //Person subscribing
            ref: "User"
        },
        channel: {
            type: mongoose.Schema.Types.ObjectId, //User who is providing content
            ref: "User"
        }
    }, 
    {timestamps: true}
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);