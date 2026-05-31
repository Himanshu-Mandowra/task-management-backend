import { Employee } from "../models/employee.model.js";

export const isOwner = async (req, res, next) => {
    try {
        const user = await Employee.findById(req.user.id)
        if (user.userRole !== "admin" && user.id !== req.params.id) {
            return res.status(404).json({
                status: false,
                message: "Unauthorized to update this user"
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