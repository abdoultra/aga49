const express = require("express");
const router = express.Router();

const {
  getBootstrapStatus,
  bootstrapSuperAdmin,
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getAdmins,
  getPublicBoardAdmins,
  updateOwnProfile,
  changeOwnPassword,
  updateAdminAccount,
  resetAdminPassword,
  deleteAdminAccount,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { loginLimiter } = require("../middlewares/rateLimitMiddleware");
const localBootstrapOnly = require("../middlewares/localBootstrapMiddleware");

router.get("/bootstrap/status", localBootstrapOnly, getBootstrapStatus);
router.post("/bootstrap", localBootstrapOnly, bootstrapSuperAdmin);
router.get("/board", getPublicBoardAdmins);
router.post(
  "/register",
  protect,
  authorize("super_admin"),
  registerAdmin,
);
router.post("/login", loginLimiter, loginAdmin);
router.get("/profile", protect, getAdminProfile);
router.put("/profile", protect, updateOwnProfile);
router.patch("/profile/password", protect, changeOwnPassword);
router.get("/accounts", protect, authorize("super_admin"), getAdmins);
router.put(
  "/accounts/:id",
  protect,
  authorize("super_admin"),
  updateAdminAccount,
);
router.patch(
  "/accounts/:id/password",
  protect,
  authorize("super_admin"),
  resetAdminPassword,
);
router.delete(
  "/accounts/:id",
  protect,
  authorize("super_admin"),
  deleteAdminAccount,
);

module.exports = router;
