const express = require("express");
const {
  createContactMessage,
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
} = require("../controllers/contactMessageController");
const { protect } = require("../middlewares/authMiddleware");
const { contactLimiter } = require("../middlewares/rateLimitMiddleware");

const router = express.Router();

router.post("/", contactLimiter, createContactMessage);
router.get("/", protect, getContactMessages);
router.get("/:id", protect, getContactMessageById);
router.patch("/:id/status", protect, updateContactMessageStatus);
router.delete("/:id", protect, deleteContactMessage);

module.exports = router;
