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
      upcoming: upcoming === "true" || upcoming === true,
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
    const {
      page = 1,
      limit = 10,
      category,
      search,
      location,
      startDate,
      endDate,
    } = req.query;

    // Build query filters
    let query = { approved: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Location filter
    if (location) {
      query.$or = [
        { "location.venue": { $regex: location, $options: "i" } },
        { "location.city": { $regex: location, $options: "i" } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) {
        query.startDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startDate.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalEvents = await Event.countDocuments(query);
    const totalPages = Math.ceil(totalEvents / limit);

    const events = await Event.find(query)
      .populate("organizer", "name email")
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalEvents,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
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

// Get events by organizer (for organizer dashboard)
export const getOrganizerEvents = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { status, approved, page = 1, limit = 10 } = req.query;

    // Build query filters
    let query = { organizer: organizerId };

    if (status) {
      query.status = status;
    }

    if (approved !== undefined) {
      query.approved = approved === "true";
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalEvents = await Event.countDocuments(query);
    const totalPages = Math.ceil(totalEvents / limit);

    const events = await Event.find(query)
      .populate("organizer", "firstName lastName email organizationName")
      .populate("tickets")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalEvents,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

  // Update event (organizer only)
  export const updateEvent = async (req, res) => {
    try {
      const { id } = req.params;
      const organizerId = req.user._id;

      // Find event and verify ownership
      const existingEvent = await Event.findById(id);
      if (!existingEvent) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (existingEvent.organizer.toString() !== organizerId.toString()) {
        return res.status(403).json({
          message: "Access denied. You can only update your own events.",
        });
      }

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

      // Handle file uploads if present
      const imagesFiles = Array.isArray(req.files?.images)
        ? req.files.images
        : [];
      const trailerFiles = Array.isArray(req.files?.trailerVideo)
        ? req.files.trailerVideo
        : [];

      let imageUrls = existingEvent.images || [];
      let trailerVideoUrl = existingEvent.trailerVideo;

      // Upload new images if provided
      if (imagesFiles.length > 0) {
        const newImageUrls = await Promise.all(
          imagesFiles.map(async (file) => {
            const uploaded = await cloudinary.uploader.upload(file.path, {
              folder: "tazkarti/eventsImages",
            });
            fs.unlinkSync(file.path);
            return uploaded.secure_url;
          })
        );
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      // Upload new trailer video if provided
      if (trailerFiles.length > 0) {
        const uploaded = await cloudinary.uploader.upload(trailerFiles[0].path, {
          folder: "tazkarti/eventsVideos",
          resource_type: "video",
        });
        trailerVideoUrl = uploaded.secure_url;
        fs.unlinkSync(trailerFiles[0].path);
      } else if (trailerVideo) {
        trailerVideoUrl = trailerVideo;
      }

      // Parse location if it's a string
      let parsedLocation = location;
      if (typeof location === "string") {
        try {
          parsedLocation = JSON.parse(location);
        } catch (e) {
          return res.status(400).json({ message: "Invalid location format." });
        }
      }

      // Update fields
      const updateData = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (category) updateData.category = category;
      if (startDate) updateData.startDate = startDate;
      if (endDate) updateData.endDate = endDate;
      if (time) updateData.time = time;
      if (parsedLocation) updateData.location = parsedLocation;
      if (status) updateData.status = status;
      if (maxAttendees) updateData.maxAttendees = maxAttendees;
      if (tags) updateData.tags = tags;
      if (upcoming !== undefined)
        updateData.upcoming = upcoming === "true" || upcoming === true;
      if (imageUrls.length > 0) updateData.images = imageUrls;
      if (trailerVideoUrl) updateData.trailerVideo = trailerVideoUrl;

      // Reset approval status if significant changes are made
      if (title || description || startDate || endDate || location) {
        updateData.approved = false;
      }

      const updatedEvent = await Event.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("organizer", "firstName lastName email organizationName");

      res.status(200).json({
        message: "Event updated successfully",
        event: updatedEvent,
      });
    } catch (error) {
      console.error("Update Event Error:", error);
      res.status(500).json({ message: error.message || "Server Error" });
    }
  };

// Delete event (organizer only)
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.user._id;

    // Find event and verify ownership
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() !== organizerId.toString()) {
      return res.status(403).json({
        message: "Access denied. You can only delete your own events.",
      });
    }

    // Check if event has bookings
    const bookingsCount = await Event.aggregate([
      { $match: { _id: event._id } },
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "event",
          as: "bookings",
        },
      },
      { $project: { bookingsCount: { $size: "$bookings" } } },
    ]);

    if (bookingsCount.length > 0 && bookingsCount[0].bookingsCount > 0) {
      return res.status(400).json({
        message:
          "Cannot delete event with existing bookings. Please cancel all bookings first.",
      });
    }

    // Delete associated tickets first
    await Event.updateOne({ _id: id }, { $unset: { tickets: 1 } });

    // Delete the event
    await Event.findByIdAndDelete(id);

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete Event Error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};
