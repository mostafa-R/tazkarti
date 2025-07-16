import User from "../models/User.js";

export const getUser = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      res.status(404);
      throw new Error("you must be logged in");
    }
    const user = await User.findById(id).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error, message: error.message });
  }
};


export const getAllUser = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error, message: error.message });
  }
};


export const update = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res.status(401).json({ message: "You must be logged in" });
    }

    // الحقول المسموح بتحديثها
    const allowedFields = ["name", "phone", "bio", "address", "avatar"];
    const updates = {};

    // فلترة وتنسيق البيانات
    for (const field of allowedFields) {
      if (field in req.body) {
        const value = req.body[field];
        updates[field] = typeof value === "string" ? value.trim() : value;
      }
    }

    // ✅ معالجة كلمة المرور (بشكل آمن)
    if (req.body.newPassword) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return res.status(400).json({ message: "New passwords do not match" });
      }

      const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
      updates.password = hashedPassword;
    }

    // التحديث
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
