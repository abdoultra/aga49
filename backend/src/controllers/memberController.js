const mongoose = require("mongoose");
const Member = require("../models/Member");
const MembershipFee = require("../models/MembershipFee");

const MEMBER_FIELDS = [
  "nom",
  "prenom",
  "email",
  "telephone",
  "adresse",
  "ville",
  "statut",
  "date_adhesion",
  "note",
];

const pickMemberFields = (body) =>
  Object.fromEntries(
    MEMBER_FIELDS.filter((field) => body[field] !== undefined).map((field) => [
      field,
      body[field],
    ]),
  );

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const handleMemberError = (error, res, action) => {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      message: "Données du membre invalides",
      errors: error.errors
        ? Object.values(error.errors).map((item) => item.message)
        : undefined,
    });
  }

  console.error(`Erreur ${action} :`, error);
  return res.status(500).json({
    message: `Erreur serveur lors de ${action}`,
  });
};

const createMember = async (req, res) => {
  try {
    const memberData = pickMemberFields(req.body);

    if (!memberData.nom || !memberData.prenom) {
      return res.status(400).json({
        message: "Le nom et le prénom sont obligatoires",
      });
    }

    const member = await Member.create({
      ...memberData,
      createdBy: req.admin._id,
    });

    return res.status(201).json({
      message: "Membre créé avec succès",
      member,
    });
  } catch (error) {
    return handleMemberError(error, res, "la création du membre");
  }
};

const getMembers = async (req, res) => {
  try {
    const members = await Member.find()
      .populate("createdBy", "nom prenom email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Liste des membres récupérée avec succès",
      count: members.length,
      members,
    });
  } catch (error) {
    return handleMemberError(error, res, "la récupération des membres");
  }
};

const getMemberById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const member = await Member.findById(req.params.id).populate(
      "createdBy",
      "nom prenom email",
    );

    if (!member) {
      return res.status(404).json({ message: "Membre introuvable" });
    }

    return res.status(200).json({
      message: "Membre récupéré avec succès",
      member,
    });
  } catch (error) {
    return handleMemberError(error, res, "la récupération du membre");
  }
};

const updateMember = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: "Membre introuvable" });
    }

    Object.assign(member, pickMemberFields(req.body));
    const updatedMember = await member.save();

    return res.status(200).json({
      message: "Membre modifié avec succès",
      member: updatedMember,
    });
  } catch (error) {
    return handleMemberError(error, res, "la modification du membre");
  }
};

const deleteMember = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: "Membre introuvable" });
    }

    if (await MembershipFee.exists({ member: member._id })) {
      return res.status(409).json({
        message:
          "Ce membre possède des cotisations. Passez-le en inactif au lieu de le supprimer.",
      });
    }

    await member.deleteOne();

    return res.status(200).json({
      message: "Membre supprimé avec succès",
    });
  } catch (error) {
    return handleMemberError(error, res, "la suppression du membre");
  }
};

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
};
