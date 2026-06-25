const express = require("express");
const router = express.Router();

const {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
} = require("../controllers/memberController");

const { protect } = require("../middlewares/authMiddleware");

router.post("/", protect, createMember);
router.get("/", protect, getMembers);
router.get("/:id", protect, getMemberById);
router.put("/:id", protect, updateMember);
router.delete("/:id", protect, deleteMember);

module.exports = router;
