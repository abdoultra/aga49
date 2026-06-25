const mongoose = require("mongoose");
const Album = require("../models/Album");
const Photo = require("../models/Photo");
const {
  getPublicFilePath,
  deleteUploadedFile,
} = require("../utils/fileUtils");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const createAlbum = async (req, res) => {
  const coverImage = req.file ? getPublicFilePath(req.file) : "";

  try {
    if (!req.body.title) {
      await deleteUploadedFile(coverImage);
      return res.status(400).json({ message: "Le titre est obligatoire" });
    }

    const album = await Album.create({
      title: req.body.title,
      description: req.body.description,
      coverImage,
      createdBy: req.admin._id,
    });

    return res.status(201).json({
      message: "Album créé avec succès",
      album,
    });
  } catch (error) {
    await deleteUploadedFile(coverImage);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Erreur createAlbum :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la création de l'album",
    });
  }
};

const getAlbums = async (req, res) => {
  try {
    const albums = await Album.find()
      .populate("createdBy", "nom prenom")
      .sort({ createdAt: -1 })
      .lean();

    const albumsWithCount = await Promise.all(
      albums.map(async (album) => ({
        ...album,
        photoCount: await Photo.countDocuments({ album: album._id }),
      })),
    );

    return res.status(200).json({
      message: "Liste des albums récupérée avec succès",
      count: albumsWithCount.length,
      albums: albumsWithCount,
    });
  } catch (error) {
    console.error("Erreur getAlbums :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des albums",
    });
  }
};

const getAlbumById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const album = await Album.findById(req.params.id).populate(
      "createdBy",
      "nom prenom",
    );

    if (!album) {
      return res.status(404).json({ message: "Album introuvable" });
    }

    const photos = await Photo.find({ album: album._id }).sort({
      displayOrder: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Album récupéré avec succès",
      album,
      photos,
    });
  } catch (error) {
    console.error("Erreur getAlbumById :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération de l'album",
    });
  }
};

const updateAlbum = async (req, res) => {
  const newCoverImage = req.file ? getPublicFilePath(req.file) : "";

  try {
    if (!isValidId(req.params.id)) {
      await deleteUploadedFile(newCoverImage);
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const album = await Album.findById(req.params.id);

    if (!album) {
      await deleteUploadedFile(newCoverImage);
      return res.status(404).json({ message: "Album introuvable" });
    }

    const previousCoverImage = album.coverImage;

    if (req.body.title !== undefined) album.title = req.body.title;
    if (req.body.description !== undefined) {
      album.description = req.body.description;
    }
    if (newCoverImage) album.coverImage = newCoverImage;

    await album.save();

    if (newCoverImage && previousCoverImage !== newCoverImage) {
      const coverIsUsedByPhoto = await Photo.exists({
        image: previousCoverImage,
      });

      if (!coverIsUsedByPhoto) {
        await deleteUploadedFile(previousCoverImage);
      }
    }

    return res.status(200).json({
      message: "Album modifié avec succès",
      album,
    });
  } catch (error) {
    await deleteUploadedFile(newCoverImage);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Erreur updateAlbum :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la modification de l'album",
    });
  }
};

const deleteAlbum = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({ message: "Album introuvable" });
    }

    const photos = await Photo.find({ album: album._id });

    await Promise.all([
      deleteUploadedFile(album.coverImage),
      ...photos.map((photo) => deleteUploadedFile(photo.image)),
    ]);
    await Photo.deleteMany({ album: album._id });
    await album.deleteOne();

    return res.status(200).json({
      message: "Album et photos associés supprimés avec succès",
    });
  } catch (error) {
    console.error("Erreur deleteAlbum :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la suppression de l'album",
    });
  }
};

module.exports = {
  createAlbum,
  getAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
};
