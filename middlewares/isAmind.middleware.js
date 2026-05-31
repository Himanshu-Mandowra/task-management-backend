import { Employee } from "../models/employee.model.js";

export const isAdmin = async (req, res, next) => {
    try {
        const user = await Employee.findById(req.user.id)
        if (user.userRole !== "admin") {
            return res.status(404).json({
                status: false,
                message: "Unauthorized for this activity"
            })
        }
        next()
        
    } catch (err) {

        res.status(500).json({
            message: "This is isOwner Middleware Error",
            error: err.message
        })
    }
}