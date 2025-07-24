import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema(
  {
    type: String,
    message: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    data: {
      type: mongoose.Schema.Types.Mixed, 
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
