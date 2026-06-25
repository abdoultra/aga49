const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    prenom: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Adresse email invalide"],
    },
    telephone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },
    sujet: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    statut: {
      type: String,
      enum: ["unread", "read", "processed"],
      default: "unread",
      index: true,
    },
    dateEnvoi: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
