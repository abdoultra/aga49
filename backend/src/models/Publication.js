const mongoose = require("mongoose");

const publicationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: ["news", "announcement", "event"],
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    location: {
      type: String,
      trim: true,
    },
    publicationDate: {
      type: Date,
      default: Date.now,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

publicationSchema.pre("validate", function () {
  if (this.type === "event" && !this.startDate) {
    this.invalidate(
      "startDate",
      "La date de début est obligatoire pour un événement",
    );
  }

  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate(
      "endDate",
      "La date de fin doit être postérieure à la date de début",
    );
  }
});

module.exports = mongoose.model("Publication", publicationSchema);
