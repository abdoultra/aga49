const mongoose = require("mongoose");
const Document = require("../models/Document");
const {
  getPublicFilePath,
  getAbsoluteUploadedPath,
  deleteUploadedFile,
} = require("../utils/fileUtils");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const createDocument = async (req, res) => {
  const filePath = req.file ? getPublicFilePath(req.file) : "";

  try {
    if (!req.body.title || !req.file) {
      await deleteUploadedFile(filePath);
      return res.status(400).json({
        message: "Le titre et le fichier sont obligatoires",
      });
    }

    const document = await Document.create({
      title: req.body.title,
      description: req.body.description,
      file: filePath,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      category: req.body.category,
      status: req.body.status,
      publicationDate: req.body.publicationDate,
      createdBy: req.admin._id,
    });

    return res.status(201).json({
      message: "Document ajouté avec succès",
      document,
    });
  } catch (error) {
    await deleteUploadedFile(filePath);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Erreur createDocument :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de l'ajout du document",
    });
  }
};

const getPublishedDocuments = async (req, res) => {
  try {
    const filters = { status: "published" };

    if (req.query.category) {
      filters.category = req.query.category;
    }

    const documents = await Document.find(filters)
      .populate("createdBy", "nom prenom")
      .sort({ publicationDate: -1 });

    return res.status(200).json({
      message: "Liste des documents publiés récupérée avec succès",
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("Erreur getPublishedDocuments :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des documents",
    });
  }
};

const getDocumentsForAdmin = async (req, res) => {
  try {
    const filters = {};

    if (req.query.status) filters.status = req.query.status;
    if (req.query.category) filters.category = req.query.category;

    const documents = await Document.find(filters)
      .populate("createdBy", "nom prenom email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Liste complète des documents récupérée avec succès",
      count: documents.length,
      filters,
      documents,
    });
  } catch (error) {
    console.error("Erreur getDocumentsForAdmin :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des documents",
    });
  }
};

const getDocumentById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      status: "published",
    }).populate("createdBy", "nom prenom");

    if (!document) {
      return res.status(404).json({ message: "Document introuvable" });
    }

    return res.status(200).json({
      message: "Document récupéré avec succès",
      document,
    });
  } catch (error) {
    console.error("Erreur getDocumentById :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération du document",
    });
  }
};

const downloadPublishedDocument = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      status: "published",
    });

    if (!document) {
      return res.status(404).json({ message: "Document introuvable" });
    }

    const absolutePath = getAbsoluteUploadedPath(document.file);
    return res.download(absolutePath, document.originalName);
  } catch (error) {
    console.error("Erreur downloadPublishedDocument :", error);
    return res.status(500).json({
      message: "Erreur serveur lors du téléchargement du document",
    });
  }
};

const downloadDocumentForAdmin = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document introuvable" });
    }

    const absolutePath = getAbsoluteUploadedPath(document.file);
    return res.download(absolutePath, document.originalName);
  } catch (error) {
    console.error("Erreur downloadDocumentForAdmin :", error);
    return res.status(500).json({
      message: "Erreur serveur lors du téléchargement du document",
    });
  }
};

const updateDocument = async (req, res) => {
  const newFilePath = req.file ? getPublicFilePath(req.file) : "";

  try {
    if (!isValidId(req.params.id)) {
      await deleteUploadedFile(newFilePath);
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      await deleteUploadedFile(newFilePath);
      return res.status(404).json({ message: "Document introuvable" });
    }

    const previousFilePath = document.file;
    const editableFields = [
      "title",
      "description",
      "category",
      "status",
      "publicationDate",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) document[field] = req.body[field];
    });

    if (req.file) {
      document.file = newFilePath;
      document.originalName = req.file.originalname;
      document.mimeType = req.file.mimetype;
      document.size = req.file.size;
    }

    await document.save();

    if (newFilePath && previousFilePath !== newFilePath) {
      await deleteUploadedFile(previousFilePath);
    }

    return res.status(200).json({
      message: "Document modifié avec succès",
      document,
    });
  } catch (error) {
    await deleteUploadedFile(newFilePath);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Erreur updateDocument :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la modification du document",
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document introuvable" });
    }

    await deleteUploadedFile(document.file);
    await document.deleteOne();

    return res.status(200).json({
      message: "Document supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur deleteDocument :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la suppression du document",
    });
  }
};

module.exports = {
  createDocument,
  getPublishedDocuments,
  getDocumentsForAdmin,
  getDocumentById,
  downloadPublishedDocument,
  downloadDocumentForAdmin,
  updateDocument,
  deleteDocument,
};
