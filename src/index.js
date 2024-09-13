import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: "./evn",
});

const port = process.env.PORT || 8002;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error starting the server", error.message);
      throw error;
      process.exit(1);
    });

    app.listen(port, () => {
      console.log(`Server running at localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("Error Connecting Database", error.message);
    throw error;
  });
