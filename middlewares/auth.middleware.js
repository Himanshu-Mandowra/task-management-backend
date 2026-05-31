import jwt from "jsonwebtoken";
import { User } from "../models/employee.model.js";

export const auth = async (req, res, next) => {
    try {
        const authHeader  = await req.header("Authorization")
        if (!authHeader) {
            return res.status(404).json({
                status: false,
                message: "token not found"
            })
        }
        const token = authHeader.replace(
            "Bearer ",
            ""
        );

        console.log(token)

        const verifytoken = jwt.verify(token,  process.env.JWT_SECRET)
        const user = await User.findById(verifytoken.id)
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "user not found"
            })
        }
        req.user = user
        console.log(verifytoken)
        next()
        
    } catch (err) {

        res.status(500).json({
            message: "server error"
        })
    }
}