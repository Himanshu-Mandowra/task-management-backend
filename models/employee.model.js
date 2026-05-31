import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        userRole: {
            type: String,
            required: true,
        },
        adminName: {
            type: String
        },
        adminId: {
            type: String
        }
        // is this needs ad require parameter

    },
    {
        timestamps: true
    }
);

export const Employee = mongoose.model("Employee", employeeSchema);
