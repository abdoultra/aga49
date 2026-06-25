const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
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
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mot_de_passe: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    telephone: {
      type: String,
    },

    fonction: {
      type: String,
    },

    photo: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["admin", "super_admin"],
      default: "admin",
    },

    actif: {
      type: Boolean,
      default: true,
    },

    ordre_affichage: {
      type: Number,
      default: 0,
    },

    date_debut_mandat: {
      type: Date,
    },

    date_fin_mandat: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);
adminSchema.pre("save", async function () {
  if (!this.isModified("mot_de_passe")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, salt);
});
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.mot_de_passe);
};
const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
