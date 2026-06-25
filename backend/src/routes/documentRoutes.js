const express = require("express");
const {
  createDocument,
  getPublishedDocuments,
  getDocumentsForAdmin,
  getDocumentById,
  downloadPublishedDocument,
  downloadDocumentForAdmin,
  updateDocument,
  deleteDocument,
} = require("../controllers/documentController");
const { protect } = require("../middlewares/authMiddleware");
const { uploadDocument } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get("/", getPublishedDocuments);
router.get("/manage", protect, getDocumentsForAdmin);
router.get(
  "/manage/:id/download",
  protect,
  downloadDocumentForAdmin,
);
router.post("/", protect, uploadDocument.single("file"), createDocument);
router.get("/:id/download", downloadPublishedDocument);
router.get("/:id", getDocumentById);
router.put("/:id", protect, uploadDocument.single("file"), updateDocument);
router.delete("/:id", protect, deleteDocument);

module.exports = router;
