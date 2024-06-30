import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import errorController from "./controllers/errorController.js";

const corsOption = {
  origin: "http://localhost:5173",
};

dotenv.config({ path: "./config.env" });

const app = express();

app.use(cors(corsOption));

const DB = process.env.DB;

mongoose.connect(DB).then((con) => {
  console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
});

app.use(express.json());

import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";

app.use("/api/v1", productRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", userRoutes);

app.use(errorController);

const server = app.listen(process.env.PORT, () => {
  console.log(
    `Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  );
});

process.on("unhandledRejection", (err) => {
  console.log("shutting down server due to unhandled promise rejection");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
