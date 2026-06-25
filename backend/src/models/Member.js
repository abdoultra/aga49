const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },

    prenom: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    telephone: {
      type: String,
      trim: true,
    },

    adresse: {
      type: String,
      trim: true,
    },

    ville: {
      type: String,
      trim: true,
    },

    statut: {
      type: String,
      enum: ["actif", "inactif"],
      default: "actif",
    },

    date_adhesion: {
      type: Date,
      default: Date.now,
    },

    note: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Member", memberSchema);
