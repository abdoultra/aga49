require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const loadEnv = require("../config/env");
const Admin = require("../models/Admin");

const requiredBootstrapVariable = (name) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Variable d'amorçage manquante : ${name}`);
  }

  return value;
};

const createSuperAdmin = async () => {
  try {
    const env = loadEnv();
    const nom = requiredBootstrapVariable("SUPER_ADMIN_NOM");
    const prenom = requiredBootstrapVariable("SUPER_ADMIN_PRENOM");
    const email = requiredBootstrapVariable("SUPER_ADMIN_EMAIL")
      .toLowerCase()
      .trim();
    const password = requiredBootstrapVariable("SUPER_ADMIN_PASSWORD");

    if (password.length < 12) {
      throw new Error(
        "SUPER_ADMIN_PASSWORD doit contenir au moins 12 caractères",
      );
    }

    await connectDB(env.mongoUri);

    const existingSuperAdmin = await Admin.findOne({
      role: "super_admin",
    });

    if (existingSuperAdmin) {
      console.log("Un super administrateur existe déjà. Aucune création.");
      return;
    }

    if (await Admin.exists({ email })) {
      throw new Error("SUPER_ADMIN_EMAIL est déjà utilisé par un autre admin");
    }

    await Admin.create({
      nom,
      prenom,
      email,
      mot_de_passe: password,
      fonction: process.env.SUPER_ADMIN_FONCTION || "Responsable AGA",
      role: "super_admin",
      actif: true,
    });

    console.log(`Super administrateur créé : ${email}`);
  } finally {
    await mongoose.connection.close();
  }
};

createSuperAdmin().catch((error) => {
  console.error("Création impossible :", error.message);
  process.exitCode = 1;
});
