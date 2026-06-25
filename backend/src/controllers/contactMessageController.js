const mongoose = require("mongoose");
const ContactMessage = require("../models/ContactMessage");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const createContactMessage = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, sujet, message } = req.body;

    if (!nom || !prenom || !email || !sujet || !message) {
      return res.status(400).json({
        message:
          "Le nom, le prénom, l'email, le sujet et le message sont obligatoires",
      });
    }

    const contactMessage = await ContactMessage.create({
      nom,
      prenom,
      email,
      telephone,
      sujet,
      message,
    });

    return res.status(201).json({
      message: "Votre message a bien été envoyé",
      contactMessage: {
        _id: contactMessage._id,
        dateEnvoi: contactMessage.dateEnvoi,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Données du message invalides",
        errors: Object.values(error.errors).map((item) => item.message),
      });
    }

    console.error("Erreur createContactMessage :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de l'envoi du message",
    });
  }
};

const getContactMessages = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.statut = req.query.status;

    const messages = await ContactMessage.find(filters).sort({
      dateEnvoi: -1,
    });

    return res.status(200).json({
      message: "Messages récupérés avec succès",
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Erreur getContactMessages :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des messages",
    });
  }
};

const getContactMessageById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const contactMessage = await ContactMessage.findById(req.params.id);

    if (!contactMessage) {
      return res.status(404).json({ message: "Message introuvable" });
    }

    return res.status(200).json({
      message: "Message récupéré avec succès",
      contactMessage,
    });
  } catch (error) {
    console.error("Erreur getContactMessageById :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération du message",
    });
  }
};

const updateContactMessageStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const allowedStatuses = ["unread", "read", "processed"];
    if (!allowedStatuses.includes(req.body.statut)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const contactMessage = await ContactMessage.findById(req.params.id);

    if (!contactMessage) {
      return res.status(404).json({ message: "Message introuvable" });
    }

    contactMessage.statut = req.body.statut;
    await contactMessage.save();

    return res.status(200).json({
      message: "Statut du message modifié avec succès",
      contactMessage,
    });
  } catch (error) {
    console.error("Erreur updateContactMessageStatus :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la modification du message",
    });
  }
};

const deleteContactMessage = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const contactMessage = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!contactMessage) {
      return res.status(404).json({ message: "Message introuvable" });
    }

    return res.status(200).json({
      message: "Message supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur deleteContactMessage :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la suppression du message",
    });
  }
};

module.exports = {
  createContactMessage,
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
};
