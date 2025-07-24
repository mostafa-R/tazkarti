import fs from "fs";
import { Event } from "../models/Event.js";
import cloudinary from "../utils/cloudinary.js";
import User from "../models/User.js";
import { sendNotification } from "../utils/sendNotification.js";
import { sendAcceptEmail, sendRejectEmail } from "../utils/emailTemplates.js";
import { sendEmail } from "../services/emailService.js";

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      startDate,
      endDate,
      time,
      location,
      status,
      maxAttendees,
      tags,
      trailerVideo,
    } = req.body;

    if (!title || !description || !startDate || !endDate || !location) {
      return res.status(400).json({
        message:
          "Title, description, startDate, endDate, and location are required.",
      });
    }

    const imagesFiles = Array.isArray(req.files?.images)
      ? req.files.images
      : [];
    const trailerFiles = Array.isArray(req.files?.trailerVideo)
      ? req.files.trailerVideo
      : [];

    const imageUrls = await Promise.all(
      imagesFiles.map(async (file) => {
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: "tazkarti/eventsImages",
        });
        fs.unlinkSync(file.path); 
        return uploaded.secure_url;
      })
    );

    let trailerVideoUrl = trailerVideo || null;

    if (trailerFiles.length > 0) {
      const uploaded = await cloudinary.uploader.upload(trailerFiles[0].path, {
        folder: "tazkarti/eventsVideos",
        resource_type: "video",
      });
      trailerVideoUrl = uploaded.secure_url;
      fs.unlinkSync(trailerFiles[0].path);
    }

    let parsedLocation = location;
    if (typeof location === "string") {
      try {
        parsedLocation = JSON.parse(location);
      } catch (e) {
        return res.status(400).json({ message: "Invalid location format." });
      }
    }

    const event = new Event({
      title,
      description,
      category,
      startDate,
      endDate,
      time,
      location: parsedLocation,
      images: imageUrls,
      trailerVideo: trailerVideoUrl,
      status: status || "draft",
      maxAttendees: maxAttendees || 100,
      organizer: req.user._id,
      tags: tags || [],
    });

    await event.save();

    const user = req.user;

    await sendNotification({
      type: "New Event Created",
      message: `A organizer has ${user.organizationName} add an event. Please check it out.
      Event Title: ${event.title}
      Event Description: ${event.description}
      Event Category: ${event.category}
      Event Start Date: ${event.startDate}
      Event End Date: ${event.endDate}
      Event Time: ${event.time}
      Event Location: ${event.location}
      Event Images: ${event.images}
      Event Trailer Video: ${event.trailerVideo}
      Event Status: ${event.status}
      Event Max Attendees: ${event.maxAttendees}
      Event Tags: ${event.tags}
      `,
      data: {
        organizerId: user._id,
        organizationName: user.organizationName,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

//approved events
export const approveEvent = async (req, res) => {

  const { approved, id } = req.body;

  try {
    const event = await Event.findByIdAndUpdate(id, { approved }, { new: true });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({
      message: `Event approval updated to ${approved}`,
    });

    const eventTitle = event.title;

    const user = await User.findById(event.organizer);

    if (approved === true || approved === "true") {

      await sendEmail(
        user.email,
        "Your Event is Approved",
        `Your Event is Approved : ${eventTitle}`,
        sendAcceptEmail(eventTitle)
      );
    }else {
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


export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("organizer", "name email");

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
