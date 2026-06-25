const express = require("express");
const {
  createPublication,
  getPublications,
  getAdminPublications,
  getPublicationById,
  updatePublication,
  deletePublication,
} = require("../controllers/publicationController");
const { protect } = require("../middlewares/authMiddleware");
const { uploadImage } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/", protect, uploadImage.single("image"), createPublication);
router.get("/", getPublications);
router.get("/manage", protect, getAdminPublications);
router.get("/:id", getPublicationById);
router.put("/:id", protect, uploadImage.single("image"), updatePublication);
router.delete("/:id", protect, deletePublication);

module.exports = router;
