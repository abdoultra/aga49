const express = require("express");
const {
  getPhotoById,
  updatePhoto,
  deletePhoto,
} = require("../controllers/photoController");
const { protect } = require("../middlewares/authMiddleware");
const { uploadImage } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get("/:id", getPhotoById);
router.put("/:id", protect, uploadImage.single("image"), updatePhoto);
router.delete("/:id", protect, deletePhoto);

module.exports = router;
