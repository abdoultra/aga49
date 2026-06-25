const mongoose = require("mongoose");

const membershipFeeSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "transfer", "mobile_money", "other"],
      default: "cash",
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "cancelled"],
      default: "paid",
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    reference: {
      type: String,
      trim: true,
    },

    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

membershipFeeSchema.index({ member: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("MembershipFee", membershipFeeSchema);
