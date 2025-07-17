import fs from "fs";
import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";

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

export const getUserById = async (req, res) => { 
  try {
    const {id} = req.params
    const user = await User.findById(id).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error, message: error.message });
  }
}

export const getAllUser = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error, message: error.message });
  }
};

export const getAllOrganizers = async (req, res) => {
  try {
    const organizers = await User.find({ role: "organizer" }).select(
      "-password"
    );
    res.status(200).json(organizers);
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

    const allowedFields = ["name", "phone", "bio", "address", "profileImage"];
    const updates = {};

    for (const field of allowedFields) {
      if (field in req.body) {
        const value = req.body[field];
        updates[field] = typeof value === "string" ? value.trim() : value;
      }
    }

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

const extractPublicId = (url) => {
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  const publicIdWithExtension = filename.split(".")[0];
  return `tazkarti/users/${publicIdWithExtension}`;
};

export const profileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.profileImage) {
      const publicId = extractPublicId(user.profileImage);
      await cloudinary.uploader.destroy(publicId);
    }

    // upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "tazkarti/users",
    });
    //delete temporary file image
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkErr) {
      console.warn("Failed to delete local file:", unlinkErr.message);
    }

    const newUser = await User.findByIdAndUpdate(
      user._id,
      { profileImage: result.secure_url },
      { new: true, runValidators: true }
    );

    res.status(200).json({ user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res.status(401).json({ message: "You must be logged in" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { deletedAt: date.now() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error, message: error.message });
  }
};

export const restoreUserbyId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await User.findByIdAndUpdate(
      id,
      { deletedAt: null },
      { new: true }
    );
    res.status(200).json({ message: "User restored successfully", user });
  } catch (error) {
    res.status(500).json({ error, message: error.message });
  }
};


export const restoreUser = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res.status(401).json({ message: "You must be logged in" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { deletedAt: null },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User restored successfully", user });
  } catch (error) {
    console.error("Restore error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
