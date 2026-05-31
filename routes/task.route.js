import express from "express";
import { Task } from "../models/task.model.js";
import { User } from "../models/employee.model.js";
import { auth } from "../middlewares/auth.middleware.js";

const app = express.Router();

// Create Task
app.post("/", auth, async (req, res) => {
    const data = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
            message: "don't be silly, submitting an empty form is not allowed dude..."
        });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({
            status: false,
            message: "You are not authorized to create a task"
        });
    }

    let taskData = { ...data, createdByUserId: userId, createdBy: user.userName, status: "pending" };

    if (data.assignedTo) {
        const assignedUser = await User.findById(data.assignedTo);
        if (!assignedUser) {
            return res.status(404).json({
                status: false,
                message: "Assigned user not found"
            });
        }
        taskData.assignedName = assignedUser.userName;
    }

    const task = await Task.create(taskData);
    res.status(201).json({
        status: true,
        message: "Task Created Successfully",
        data: task
    });
});

// Get All Tasks
app.get("/", auth, async (req, res) => {
    try {
        const user = req.user;

        if (user.role === "admin") {
            const tasks = await Task.find().populate("assignedTo");
            if (!tasks) {
                return res.status(404).json({ status: false, message: "Tasks not found" });
            }

            return res.status(200).json({
                status: true,
                message: "Tasks Fetched Successfully",
                data: tasks
            });
        };


        let assignedTask = await Task.find({ assignedTo: user.id });
        let unAssignedTasks = await Task.find({ assignedTo: null });

        if (user.role === "user") {
            return res.status(200).json({
                status: true,
                message: "Assigned and Unassigned Tasks Fetched Successfully",
                assignedTasks: assignedTask,
                UnassignedTasks: unAssignedTasks
            });
        }
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
});

// Get Task By ID --- Do I have to get by id for not assigned task ??
app.get("/:taskId", auth, async (req, res) => {
    const task = await Task.findById(req.params.taskId).populate("assignedTo");
    if (!task) {
        return res.status(404).json({ status: false, message: "Task not found" });
    }
    if (task.assignedTo) {
        if (task.assignedTo !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                status: false,
                message: "You are not authorized to view this task"
            });
        }
    }
    return res.status(200).json({
        status: true,
        message: "Task Fetched Successfully",
        data: task
    });
});

// Update Task
app.put("/update/:taskId", auth, async (req, res) => {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ message: "No data provided for update" });
    }
    const task = await Task.findByIdAndUpdate(req.params.taskId, data, { new: true });
    if (!task) {
        return res.status(404).json({ status: false, message: "Task not found" });
    }

    // Allow update if admin OR if the task is assigned to the user
    if (req.user.role !== "admin") {
        return res.status(403).json({ status: false, message: "Not authorized to update this task status" });
    }

    return res.status(200).json({
        status: true,
        message: "Task Updated Successfully",
        data: task
    });
});

// Update Task Status --- Enums needed to verify the correct value passed.
app.patch("/status/:taskId", auth, async (req, res) => {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ message: "Status is required" });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
        return res.status(404).json({ status: false, message: "Task not found" });
    }

    // Check if dueDate is passed
    if (task.dueDate && new Date(task.dueDate) < new Date()) {
        if (task.status !== "expired") {
            task.status = "expired";
            await task.save();
        }
        return res.status(400).json({ 
            status: false, 
            message: "Cannot update status: Task has expired" 
        });
    }

    // Allow update if admin OR if the task is assigned to the user
    if (req.user.role !== "admin" && task.assignedTo?.toString() !== req.user.id) {
        return res.status(403).json({ status: false, message: "Not authorized to update this task status" });
    }

    task.status = status;
    await task.save();

    return res.status(200).json({ status: true, message: "Task Status Updated Successfully", data: task });
})

// Delete Task
app.delete("/delete/:taskId/:userID", async (req, res) => {
    const user = await User.findById(req.params.userID);
    if (user.userRole !== "admin") {
        return res.status(403).json({
            status: false,
            message: "You are not authorized to delete this task"
        });
    };
    const task = await Task.findByIdAndDelete(req.params.taskId);
    if (!task) {
        return res.status(404).json({ status: false, message: "Task not found" });
    }
    return res.status(200).json({
        status: true,
        message: "Task Deleted Successfully"
    });
});

// Assign User to Task
app.patch("/assign/:taskId", auth, async (req, res) => {

    const adminID = req.user.adminId
    const userId = req.body.userId;
    const taskId = req.params.taskId;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            status: false,
            message: "User not found"
        });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({
            status: false,
            message: "You are not authorized to assign this task"
        });
    }

    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            status: false,
            message: "Task not found"
        });
    }

    // Check if already assigned to avoid duplicates if assignedTo is an array, 
    // or just overwrite if it's a single field
    const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { assignedTo: userId, assignedName: user.userName },
        { new: true }
    ).populate("assignedTo");

    return res.status(200).json({
        status: true,
        message: "User Assigned to Task Successfully",
        data: updatedTask
    });
});

export default app;