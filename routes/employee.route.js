import express from "express";
import { Employee } from "../models/employee.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { auth } from "../middlewares/auth.middleware.js";
import { isOwner } from "../middlewares/ownership.middleware.js";
import { isAdmin } from "../middlewares/isAmind.middleware.js";
import { canDeleteUser, userDelete } from "../middlewares/canDeleteUser.middleware.js";
import { deleteUser } from "../controller/deleteUser.controller.js";

const app = express.Router();


app.post("/superAdmin-create", async (req, res) => {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
            message: "don't be silly, submitting an empty form is not allowed dude..."
        });
    }

    try {
        const existingUser = await Employee.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const encryptedPassword = await bcrypt.hash(data.password, 10);
        const superAdmin = await Employee.create({
            ...data,
            password: process.env.ENCRYPTED_PASSWORD,
            userRole: "admin" // Force role to admin
        });

        res.status(201).json({
            status: true,
            message: "Super Admin Created Successfully",
            data: superAdmin
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
})

// remove token generation fron sign up
app.post("/register", auth, async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ message: "Unauthorized" });
        const data = req.body;
        if (!data || !data.password) return res.status(400).json({ message: "Invalid data" });
        data.adminName = req.user.userName;
        data.adminId = req.user.id;
        data.password = await bcrypt.hash(data.password, 10);
        const user = await Employee.create(data);
        res.status(201).json({ status: true, message: "User Registered Successfully", data: user });
    } catch (error) { res.status(500).json({ status: false, message: error.message }); }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Employee.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ status: false, message: "Incorrect email or password" });
        }
        const token = jwt.sign({ id: user._id, email: user.email, role: user.userRole }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({ status: true, message: "User Logged In Successfully", data: user, token });
    } catch (error) { res.status(500).json({ status: false, message: error.message }); }
});

app.post("/update/:userId", auth, isOwner, async (req, res) => {
    try {
        const userID = req.params.userId;
        const data = req.body;
        if (data.password || data.email) return res.status(400).json({ message: "Cannot update email/password" });
        const user = await Employee.findByIdAndUpdate(userID, data, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ status: true, message: "User Updated Successfully", data: user });
    } catch (error) { res.status(500).json({ status: false, message: error.message }); }
});

app.get("/", auth, isAdmin, async (req, res) => {
    try {
        const users = await Employee.find({ adminId: req.user.id });
        res.status(200).json({ status: true, message: "Users Fetched Successfully", data: users });
    } catch (error) { res.status(500).json({ status: false, message: error.message }); }
});

app.get("/:userId", auth, isOwner, async (req, res) => {
    try {
        const user = await Employee.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ status: true, message: "User Fetched Successfully", data: user });
    } catch (error) { res.status(500).json({ status: false, message: error.message }); }
});

app.delete("/delete/:userId", auth, isAdmin, canDeleteUser, deleteUser);

export default app;