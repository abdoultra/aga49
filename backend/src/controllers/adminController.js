const Admin = require("../models/Admin");
const generateToken = require("../utils/generateToken");
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getBootstrapStatus = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();

    return res.status(200).json({
      available: adminCount === 0,
      adminCount,
    });
  } catch (error) {
    console.error("Erreur getBootstrapStatus :", error);
    return res.status(500).json({
      message: "Impossible de vérifier l'état de l'amorçage",
    });
  }
};

const bootstrapSuperAdmin = async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, fonction } = req.body;

    if (!nom || !prenom || !email || !mot_de_passe) {
      return res.status(400).json({
        message: "Le nom, le prénom, l'email et le mot de passe sont obligatoires",
      });
    }

    if (mot_de_passe.length < 12) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 12 caractères",
      });
    }

    if ((await Admin.countDocuments()) !== 0) {
      return res.status(409).json({
        message: "L'amorçage est désactivé car un administrateur existe déjà",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const admin = await Admin.create({
      nom,
      prenom,
      email: normalizedEmail,
      mot_de_passe,
      fonction: fonction || "Responsable AGA",
      role: "super_admin",
      actif: true,
    });

    return res.status(201).json({
      message: "Premier super administrateur créé avec succès",
      admin: {
        id: admin._id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email,
        fonction: admin.fonction,
        role: admin.role,
        actif: admin.actif,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Cette adresse email est déjà utilisée",
      });
    }

    console.error("Erreur bootstrapSuperAdmin :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de l'amorçage du super administrateur",
    });
  }
};

// Inscription d'un admin
const registerAdmin = async (req, res) => {
  try {
    const {
      nom,
      prenom,
      email,
      mot_de_passe,
      telephone,
      fonction,
    } = req.body;

    // Vérifier si les champs obligatoires sont présents
    if (!nom || !prenom || !email || !mot_de_passe) {
      return res.status(400).json({
        message: "Veuillez remplir tous les champs obligatoires",
      });
    }

    if (mot_de_passe.length < 8) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Vérifier si l'email est déjà utilisé
    const adminExists = await Admin.findOne({ email: normalizedEmail });

    if (adminExists) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé",
      });
    }

    // Créer l'admin
    // Le mot de passe sera hashé automatiquement grâce au pre("save") du modèle
    const admin = await Admin.create({
      nom,
      prenom,
      email: normalizedEmail,
      mot_de_passe,
      telephone,
      fonction,
      role: "admin",
      actif: true,
    });

    return res.status(201).json({
      message: "Admin créé avec succès",
      admin: {
        id: admin._id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email,
        telephone: admin.telephone,
        fonction: admin.fonction,
        role: admin.role,
        actif: admin.actif,
      },
    });
  } catch (error) {
    console.error("Erreur registerAdmin :", error);

    return res.status(500).json({
      message: "Erreur serveur lors de la création de l'admin",
    });
  }
};
const loginAdmin = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({
        message: "Email et mot de passe obligatoires",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    }).select("+mot_de_passe");

    if (!admin) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect",
      });
    }

    const isPasswordValid = await admin.comparePassword(mot_de_passe);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect",
      });
    }

    if (!admin.actif) {
      return res.status(403).json({
        message: "Compte administrateur désactivé",
      });
    }

    const token = generateToken(admin._id);

    return res.status(200).json({
      message: "Connexion réussie",
      token,
      admin: {
        id: admin._id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email,
        telephone: admin.telephone,
        fonction: admin.fonction,
        role: admin.role,
        actif: admin.actif,
      },
    });
  } catch (error) {
    console.error("Erreur loginAdmin :", error);

    return res.status(500).json({
      message: "Erreur serveur lors de la connexion",
    });
  }
};
const getAdminProfile = async (req, res) => {
  return res.status(200).json({
    message: "Profil admin récupéré avec succès",
    admin: req.admin,
  });
};

const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Administrateurs récupérés avec succès",
      count: admins.length,
      admins,
    });
  } catch (error) {
    console.error("Erreur getAdmins :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des administrateurs",
    });
  }
};

const getPublicBoardAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({
      actif: true,
      ordre_affichage: { $gt: 0 },
    })
      .select(
        "nom prenom fonction photo ordre_affichage date_debut_mandat date_fin_mandat",
      )
      .sort({ ordre_affichage: 1, nom: 1, prenom: 1 });

    return res.status(200).json({
      message: "Bureau de l'association récupéré avec succès",
      count: admins.length,
      admins,
    });
  } catch (error) {
    console.error("Erreur getPublicBoardAdmins :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération du bureau",
    });
  }
};

const updateOwnProfile = async (req, res) => {
  try {
    const editableFields = ["nom", "prenom", "email", "telephone", "fonction"];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) req.admin[field] = req.body[field];
    });

    await req.admin.save();

    return res.status(200).json({
      message: "Profil modifié avec succès",
      admin: req.admin,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }
    return res.status(400).json({ message: error.message });
  }
};

const changeOwnPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Le mot de passe actuel et le nouveau sont obligatoires",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Le nouveau mot de passe doit contenir au moins 8 caractères",
      });
    }

    const admin = await Admin.findById(req.admin._id).select("+mot_de_passe");
    if (!(await admin.comparePassword(currentPassword))) {
      return res.status(401).json({ message: "Mot de passe actuel incorrect" });
    }

    admin.mot_de_passe = newPassword;
    await admin.save();

    return res.status(200).json({
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    console.error("Erreur changeOwnPassword :", error);
    return res.status(500).json({
      message: "Erreur serveur lors du changement de mot de passe",
    });
  }
};

const updateAdminAccount = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Administrateur introuvable" });
    }

    if (
      admin._id.equals(req.admin._id) &&
      (req.body.actif === false || req.body.role === "admin")
    ) {
      return res.status(409).json({
        message: "Vous ne pouvez pas désactiver ou rétrograder votre compte",
      });
    }

    if (admin.role === "super_admin" && req.body.role === "admin") {
      const superAdminCount = await Admin.countDocuments({
        role: "super_admin",
      });
      if (superAdminCount <= 1) {
        return res.status(409).json({
          message: "Le dernier super administrateur ne peut pas être rétrogradé",
        });
      }
    }

    const editableFields = [
      "nom",
      "prenom",
      "email",
      "telephone",
      "fonction",
      "role",
      "actif",
    ];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) admin[field] = req.body[field];
    });
    await admin.save();

    return res.status(200).json({
      message: "Compte administrateur modifié avec succès",
      admin,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }
    return res.status(400).json({ message: error.message });
  }
};

const resetAdminPassword = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }
    if (!req.body.newPassword || req.body.newPassword.length < 8) {
      return res.status(400).json({
        message: "Le nouveau mot de passe doit contenir au moins 8 caractères",
      });
    }

    const admin = await Admin.findById(req.params.id).select("+mot_de_passe");
    if (!admin) {
      return res.status(404).json({ message: "Administrateur introuvable" });
    }

    admin.mot_de_passe = req.body.newPassword;
    await admin.save();

    return res.status(200).json({
      message: "Mot de passe réinitialisé avec succès",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur lors de la réinitialisation du mot de passe",
    });
  }
};

const deleteAdminAccount = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }
    if (req.admin._id.equals(req.params.id)) {
      return res.status(409).json({
        message: "Vous ne pouvez pas supprimer votre propre compte",
      });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Administrateur introuvable" });
    }

    if (admin.role === "super_admin") {
      const superAdminCount = await Admin.countDocuments({
        role: "super_admin",
      });
      if (superAdminCount <= 1) {
        return res.status(409).json({
          message: "Le dernier super administrateur ne peut pas être supprimé",
        });
      }
    }

    await admin.deleteOne();
    return res.status(200).json({
      message: "Compte administrateur supprimé avec succès",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur lors de la suppression du compte",
    });
  }
};

module.exports = {
  getBootstrapStatus,
  bootstrapSuperAdmin,
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getAdmins,
  getPublicBoardAdmins,
  updateOwnProfile,
  changeOwnPassword,
  updateAdminAccount,
  resetAdminPassword,
  deleteAdminAccount,
};
