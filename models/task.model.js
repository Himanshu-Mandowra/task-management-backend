import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        dueDate: {
            type: Date,
        },
        createdBy: {
            type: String,
        },
        createdByUserId: {
            type: mongoose.Types.ObjectId,
            ref: "User"
        },
        status: {
            type: String,
        },
        assignedTo: {
            type: mongoose.Types.ObjectId,
            ref: "User"
        },
        assignedName: {
           type: String
        },
    },
    {
        timestamps: true
    }
);

export const Task = mongoose.model("Task", taskSchema);
