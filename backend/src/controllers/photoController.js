const mongoose = require("mongoose");
const Album = require("../models/Album");
const Photo = require("../models/Photo");
const {
  getPublicFilePath,
  deleteUploadedFile,
} = require("../utils/fileUtils");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeDisplayOrder = (value) => {
  if (value === undefined || value === "") return 0;
  return Number(value);
};

const createPhoto = async (req, res) => {
  const image = req.file ? getPublicFilePath(req.file) : "";

  try {
    if (!isValidId(req.params.albumId)) {
      await deleteUploadedFile(image);
      return res.status(400).json({ message: "Identifiant d'album invalide" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "L'image est obligatoire" });
    }

    const album = await Album.findById(req.params.albumId);

    if (!album) {
      await deleteUploadedFile(image);
      return res.status(404).json({ message: "Album introuvable" });
    }

    const photo = await Photo.create({
      album: album._id,
      image,
      caption: req.body.caption,
      displayOrder: normalizeDisplayOrder(req.body.displayOrder),
      createdBy: req.admin._id,
    });

    if (!album.coverImage) {
      album.coverImage = image;
      await album.save();
    }

    return res.status(201).json({
      message: "Photo ajoutée avec succès",
      photo,
    });
  } catch (error) {
    await deleteUploadedFile(image);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Erreur createPhoto :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de l'ajout de la photo",
    });
  }
};

const getPhotosByAlbum = async (req, res) => {
  try {
    if (!isValidId(req.params.albumId)) {
      return res.status(400).json({ message: "Identifiant d'album invalide" });
    }

    const album = await Album.findById(req.params.albumId);

    if (!album) {
      return res.status(404).json({ message: "Album introuvable" });
    }

    const photos = await Photo.find({ album: album._id }).sort({
      displayOrder: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Photos récupérées avec succès",
      count: photos.length,
      photos,
    });
  } catch (error) {
    console.error("Erreur getPhotosByAlbum :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des photos",
    });
  }
};

const getPhotoById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const photo = await Photo.findById(req.params.id).populate(
      "album",
      "title description",
    );

    if (!photo) {
      return res.status(404).json({ message: "Photo introuvable" });
    }

    return res.status(200).json({
      message: "Photo récupérée avec succès",
      photo,
    });
  } catch (error) {
    console.error("Erreur getPhotoById :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération de la photo",
    });
  }
};

const updatePhoto = async (req, res) => {
  const newImage = req.file ? getPublicFilePath(req.file) : "";

  try {
    if (!isValidId(req.params.id)) {
      await deleteUploadedFile(newImage);
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      await deleteUploadedFile(newImage);
      return res.status(404).json({ message: "Photo introuvable" });
    }

    const previousImage = photo.image;
    const album = await Album.findById(photo.album);

    if (req.body.caption !== undefined) photo.caption = req.body.caption;
    if (req.body.displayOrder !== undefined) {
      photo.displayOrder = normalizeDisplayOrder(req.body.displayOrder);
    }
    if (newImage) photo.image = newImage;

    await photo.save();

    if (newImage && previousImage !== newImage) {
      if (album && album.coverImage === previousImage) {
        album.coverImage = newImage;
        await album.save();
      }

      await deleteUploadedFile(previousImage);
    }

    return res.status(200).json({
      message: "Photo modifiée avec succès",
      photo,
    });
  } catch (error) {
    await deleteUploadedFile(newImage);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Erreur updatePhoto :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la modification de la photo",
    });
  }
};

const deletePhoto = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ message: "Photo introuvable" });
    }

    const album = await Album.findById(photo.album);

    await deleteUploadedFile(photo.image);
    await photo.deleteOne();

    if (album && album.coverImage === photo.image) {
      const nextPhoto = await Photo.findOne({ album: album._id }).sort({
        displayOrder: 1,
        createdAt: -1,
      });
      album.coverImage = nextPhoto ? nextPhoto.image : "";
      await album.save();
    }

    return res.status(200).json({
      message: "Photo supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur deletePhoto :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la suppression de la photo",
    });
  }
};

module.exports = {
  createPhoto,
  getPhotosByAlbum,
  getPhotoById,
  updatePhoto,
  deletePhoto,
};
