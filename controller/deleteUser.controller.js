export const deleteUser = async (req, res) => {

    try {

        const user = await Employee.findById(req.params.userId);

        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }

        await Employee.updateMany(
            { adminId: user._id },
            {
                adminId: req.user.id,
                adminName: req.user.userName
            }
        );

        await Employee.findByIdAndDelete(req.params.userId);

        return res.status(200).json({
            status: true,
            message: "User Deleted Successfully"
        });

    } catch(error){
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}