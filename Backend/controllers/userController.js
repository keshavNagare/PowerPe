const User = require("../models/User");

// Update user by admin
exports.updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating user" });
  }
};
