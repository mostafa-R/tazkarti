import cron from "node-cron";
import ArchivedUser from "../models/ArchivedUser.js";
import User from "../models/User.js";

cron.schedule("0 2 * * *", async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // users deleted for more than 30 days
    const usersToArchive = await User.find({
      deletedAt: { $lte: thirtyDaysAgo },
    });

    for (const user of usersToArchive) {
      // 1. save a copy in ArchivedUser
      await ArchivedUser.create(user.toObject());

      // 2. delete the user from User collection
      await User.findByIdAndDelete(user._id);
    }

    console.log(` Archived ${usersToArchive.length} users`);
  } catch (error) {
    console.error(" Archiving job failed:", error);
  }
});
