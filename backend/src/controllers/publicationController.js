const mongoose = require("mongoose");
const Publication = require("../models/Publication");
const {
  getPublicFilePath,
  deleteUploadedFile,
} = require("../utils/fileUtils");

const PUBLICATION_FIELDS = [
  "title",
  "content",
  "type",
  "status",
  "priority",
  "location",
  "publicationDate",
  "startDate",
  "endDate",
];

const pickPublicationFields = (body) =>
  Object.fromEntries(
    PUBLICATION_FIELDS.filter((field) => body[field] !== undefined).map(
      (field) => [field, body[field]],
    ),
  );

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildFilters = (query, { publicOnly = false } = {}) => {
  const { type, status, priority, upcoming } = query;
  const filters = {};

  if (type) filters.type = type;
  if (priority) filters.priority = priority;
  if (upcoming === "true") filters.startDate = { $gte: new Date() };

  if (publicOnly) {
    filters.status = "published";
  } else if (status) {
    filters.status = status;
  }

  return filters;
};

const findPublications = (filters, sort = { createdAt: -1 }) =>
  Publication.find(filters)
    .populate("createdBy", "nom prenom email")
    .sort(sort);

const createPublication = async (req, res) => {
  const uploadedImage = req.file ? getPublicFilePath(req.file) : "";

  try {
    const publicationData = pickPublicationFields(req.body);

    if (
      !publicationData.title ||
      !publicationData.content ||
      !publicationData.type
    ) {
      await deleteUploadedFile(uploadedImage);
      return res.status(400).json({
        message: "Le titre, le contenu et le type sont obligatoires",
      });
    }

    if (uploadedImage) publicationData.image = uploadedImage;

    const publication = await Publication.create({
      ...publicationData,
      createdBy: req.admin._id,
    });

    return res.status(201).json({
      message: "Publication créée avec succès",
      publication,
    });
  } catch (error) {
    await deleteUploadedFile(uploadedImage);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Données de publication invalides",
        errors: Object.values(error.errors).map((item) => item.message),
      });
    }

    console.error("Erreur createPublication :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la création de la publication",
    });
  }
};

const getPublications = async (req, res) => {
  try {
    const filters = buildFilters(req.query, { publicOnly: true });
    const publications = await findPublications(
      filters,
      req.query.upcoming === "true" ? { startDate: 1 } : { createdAt: -1 },
    );

    return res.status(200).json({
      message: "Liste des publications publiques récupérée avec succès",
      count: publications.length,
      filters,
      publications,
    });
  } catch (error) {
    console.error("Erreur getPublications :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des publications",
    });
  }
};

const getAdminPublications = async (req, res) => {
  try {
    const filters = buildFilters(req.query);
    const publications = await findPublications(filters);

    return res.status(200).json({
      message: "Liste des publications de gestion récupérée avec succès",
      count: publications.length,
      filters,
      publications,
    });
  } catch (error) {
    console.error("Erreur getAdminPublications :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des publications",
    });
  }
};

const getPublicationById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const publication = await Publication.findOne({
      _id: req.params.id,
      status: "published",
    }).populate("createdBy", "nom prenom email");

    if (!publication) {
      return res.status(404).json({ message: "Publication introuvable" });
    }

    return res.status(200).json({
      message: "Publication récupérée avec succès",
      publication,
    });
  } catch (error) {
    console.error("Erreur getPublicationById :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération de la publication",
    });
  }
};

const updatePublication = async (req, res) => {
  const uploadedImage = req.file ? getPublicFilePath(req.file) : "";

  try {
    if (!isValidId(req.params.id)) {
      await deleteUploadedFile(uploadedImage);
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const publication = await Publication.findById(req.params.id);

    if (!publication) {
      await deleteUploadedFile(uploadedImage);
      return res.status(404).json({ message: "Publication introuvable" });
    }

    const previousImage = publication.image;
    Object.assign(publication, pickPublicationFields(req.body));
    if (uploadedImage) publication.image = uploadedImage;
    await publication.save();

    if (uploadedImage && previousImage !== uploadedImage) {
      await deleteUploadedFile(previousImage);
    }

    return res.status(200).json({
      message: "Publication modifiée avec succès",
      publication,
    });
  } catch (error) {
    await deleteUploadedFile(uploadedImage);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Données de publication invalides",
        errors: Object.values(error.errors).map((item) => item.message),
      });
    }

    console.error("Erreur updatePublication :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la modification de la publication",
    });
  }
};

const deletePublication = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const publication = await Publication.findById(req.params.id);

    if (!publication) {
      return res.status(404).json({ message: "Publication introuvable" });
    }

    await deleteUploadedFile(publication.image);
    await publication.deleteOne();

    return res.status(200).json({
      message: "Publication supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur deletePublication :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la suppression de la publication",
    });
  }
};

module.exports = {
  createPublication,
  getPublications,
  getAdminPublications,
  getPublicationById,
  updatePublication,
  deletePublication,
};
