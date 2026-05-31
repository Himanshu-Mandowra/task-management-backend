import { Employee } from "../models/employee.model.js";

export const canDeleteUser = async (req, res, next) => {

    if (req.user.id === req.params.userId) {
        return res.status(403).json({
            message: "You can't delete yourself!"
        });
    }

    if (
        req.user.adminId &&
        req.user.adminId === req.params.userId
    ) {
        return res.status(403).json({
            message: "You can't delete your creator!"
        });
    }

    next();
}