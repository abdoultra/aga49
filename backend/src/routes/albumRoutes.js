const express = require("express");
const {
  createAlbum,
  getAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
} = require("../controllers/albumController");
const {
  createPhoto,
  getPhotosByAlbum,
} = require("../controllers/photoController");
const { protect } = require("../middlewares/authMiddleware");
const { uploadImage } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get("/", getAlbums);
router.post("/", protect, uploadImage.single("coverImage"), createAlbum);

router.get("/:albumId/photos", getPhotosByAlbum);
router.post(
  "/:albumId/photos",
  protect,
  uploadImage.single("image"),
  createPhoto,
);

router.get("/:id", getAlbumById);
router.put("/:id", protect, uploadImage.single("coverImage"), updateAlbum);
router.delete("/:id", protect, deleteAlbum);

module.exports = router;
