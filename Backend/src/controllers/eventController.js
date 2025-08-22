import fs from "fs";
import { Event } from "../models/Event.js";
import cloudinary from "../utils/cloudinary.js";
import { sendNotification } from "../utils/sendNotification.js";

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
      upcoming,
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
      upcoming: upcoming === 'true' || upcoming === true,
      approved: false, // Events must be approved by admin before appearing on site
      status: status || "draft",
      maxAttendees: maxAttendees || 100,
      organizer: req.user._id,
      tags: tags || [],
    });

    await event.save();

    const user = req.user;


    try {
      await sendNotification({
        type: "New Event Created",
        message: `${user.organizationName} has created a new event: "${event.title}". Please review and approve.`,
        data: {
          eventId: event._id,
          organizerId: user._id,
          organizationName: user.organizationName,
          eventTitle: event.title,
        },
      });
    } catch (error) {
      console.error("Notification Error:", error);
    }

    res.status(201).json(event);
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    // Only return approved events for public consumption
    const events = await Event.find({ approved: true })
      .populate("organizer", "name email")
      .sort({ startDate: 1 });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin/Organizer endpoint to see all events (including unapproved)
export const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id).populate([
      { path: "organizer", select: "name email" },
      { path: "tickets" },
    ]);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      upcoming: true,
      approved: true,
    })
      .populate("organizer", "name email")
      .sort({ startDate: 1 });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
