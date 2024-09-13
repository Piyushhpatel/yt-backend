import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const mongoInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("MongoDB connected on host: ", mongoInstance.connection.host);
    } catch (error) {
        console.log("Error Connecting to DB")
        console.log("Error Message", error.message);
        throw error;
    }
}

export default connectDB;