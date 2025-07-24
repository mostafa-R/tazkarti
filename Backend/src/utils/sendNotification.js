export const sendNotification = async ({
  type,
  message,
  data = {},
}) => {
  try {
    const admin = await User.findOne({ role: "admin" });
    const notification = await Notification.create({
      user: admin._id,
      type,
      message,
      data,
    });
    return notification;
  } catch (err) {
    console.error("Error sending notification:", err.message);
  }
};
