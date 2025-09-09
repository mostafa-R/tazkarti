import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      maxlength: 2000,
    },

    category: {
      type: String,
      required: [true, "Event category is required"],
      
    },

    // date: {
    //   type: Date,
    //   required: [true, "Event date is required"],
    //   validate: {
    //     validator: function(value) {
    //       return value > new Date();
    //     },
    //     message: "Event date must be in the future"
    //   }
    // },

    startDate: {
      type: Date,
      required: [true, "Event date is required"],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Event date must be in the future",
      },
    },
    endDate: {
      type: Date,
      required: [true, "Event end date is required"],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "Event end date must be after the start date",
      },
    },

    time: {
      type: String,
      required: [true, "Event time is required"],
      validate: {
        validator: function (value) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
        },
        message: "Time must be in HH:MM format",
      },
    },

    location: {
      venue: {
        type: String,
        required: [true, "Venue is required"],
        trim: true,
      },
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    images: [String],

    trailerVideo: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "draft",
    },

    approved: {
      type: Boolean,
      default: false,
    },

     upcoming: {
      type: Boolean,
      default: false,
    },

    maxAttendees: {
      type: Number,
      min: 1,
      default: 100,
    },
    currentAttendees: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",

      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual للتحقق من توفر أماكن
eventSchema.virtual("isSoldOut").get(function () {
  return this.currentAttendees >= this.maxAttendees;
});

// Virtual للأماكن المتاحة
eventSchema.virtual("availableSpots").get(function () {
  return this.maxAttendees - this.currentAttendees;
});

// Index للبحث
eventSchema.index({ title: "text", description: "text" });
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ organizer: 1 });

export const Event = mongoose.model("Event", eventSchema);
