const express = require("express");
const router = express.Router();

const {
  createMembershipFee,
  getMembershipFees,
  getMembershipFeeById,
  updateMembershipFee,
  deleteMembershipFee,
} = require("../controllers/membershipFeeController");

const { protect } = require("../middlewares/authMiddleware");

router.post("/", protect, createMembershipFee);
router.get("/", protect, getMembershipFees);
router.get("/:id", protect, getMembershipFeeById);
router.put("/:id", protect, updateMembershipFee);
router.delete("/:id", protect, deleteMembershipFee);

module.exports = router;
