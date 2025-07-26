import fs from "fs";
import { Event } from "../models/Event.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendEmail } from "../services/emailService.js";
import cloudinary from "../utils/cloudinary.js";
import { sendAcceptEmail, sendRejectEmail } from "../utils/emailTemplates.js";

export const getUser = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      res.status(404);
      throw new Error("you must be logged in");
    }
    const user = await User.findById(id)
      .select("-password")
      .populate("ticketsBooked");
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
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ deletedAt: null });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error, message: error.message });
  }
};

// export const getAllOrganizers = async (req, res) => {
//   try {
//     const organizers = await User.find({ role: "organizer" });
//     res.status(200).json(organizers);
//   } catch (error) {
//     res.status(500).json({ error, message: error.message });
//   }
// };

export const update = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res.status(401).json({ message: "You must be logged in" });
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "phone",
      "bio",
      "address",
      "profileImage",
    ];
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

    res.status(200).json({ message: "Image uploaded successfully" });
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

/// admin notifications

export const getNotifictions = async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
  
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

//approved events
export const approveEvent = async (req, res) => {
  const { approved, id } = req.body;

  try {
    const event = await Event.findByIdAndUpdate(
      id,
      { approved },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

  

    const eventTitle = event.title;

    const user = await User.findById(event.organizer);

    if (approved === true || approved === "true") {
      await sendEmail(
        user.email,
        "Your Event is Approved",
        `Your Event is Approved : ${eventTitle}`,
        sendAcceptEmail(eventTitle)
      );
    } else {
      await sendEmail(
        user.email,
        "Your Event is Rejected",
        `Your Event is Rejected : ${eventTitle}`,
        sendRejectEmail(eventTitle)
      );
    }

    res.status(200).json({
      message: `Event approval updated to ${approved}`,
      event,
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating user approval status" });
  }
};
