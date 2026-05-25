import express from "express";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const app = express.Router();

app.post("/register", async (req, res) => {
    const data = req.body;

    if (!data) {
        return res.json({
            message: "don't be silly, submitting an empty form is not allowed dude..."
        })
    };


    // Generate JWT Token
    const user = await User.create(data);
    const token = await jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.userRole
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    res.status(201).json({
        status: true,
        message: "User Registered Successfully",
        data: user,
        token
    })

});

app.post("/login", async (req, res) => {

    const data = req.body;
    if (!data) {
        return res.json({
            message: "don't be silly, submitting an empty form is not allowed dude..."
        })
    };

    const user = await User.findOne({ email: data.email });

    if (!user) {
        return res.json({
            message: "User not found"
        })
    };

    if (user.password !== data.password) {
        return res.status(400).json({
            status: false,
            message: "Icorrect email or password",
            data: user,
            token
        })
    };

    const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.userRole
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    return res.status(200).json({
        status: true,
        message: "User Logged In Successfully",
        data: user,
        token
    });
});

app.post("/update/:userId", async (req, res) => {

    const data = req.body;
    const userID = req.params.userId;

    if (!data) {
        return res.json({
            message: "don't be silly, submitting an empty form is not allowed dude..."
        })
    };

    if (data.password || data.email) {
        return res.status(400).json({
            status: false,
            message: "you can not update email or password ... for now :)"
        })
    }

    const user = await User.findByIdAndUpdate(userID, data, { new: true });

    if (!user) {
        return res.status(404).json({
            status: false,
            message: "User not found"
        })
    };

    return res.status(200).json({
        status: true,
        message: "User Updated Successfully",
        data: user,
        email: data.email
    });

})

app.get("/", async (req, res) => {
    const users = await User.find();
    return res.status(200).json({
        status: true,
        message: "Users Fetched Successfully",
        data: users
    });
});

app.get("/:userId", async (req, res) => {
    const userID = req.params.userId;
    const user = await User.findById(userID);

    if (!user) {
        return res.status(404).json({
            status: false,
            message: "User not found"
        })
    };

    return res.status(200).json({
        status: true,
        message: "User Fetched Successfully",
        data: user
    });
});

export default app;