import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/employee.route.js";
import taskRouter from "./routes/task.route.js";
import dotenv from "dotenv"

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Connted to Database");
}).catch((err) => {
    console.log("There is problem connecting with the server:", err);
});

app.use("/user", userRouter);
app.use("/task", taskRouter);

app.listen(process.env.PORT, () => {
    console.log("Server is started on port:", process.env.PORT)
});