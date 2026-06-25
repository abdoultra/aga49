const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Accès refusé, aucun token fourni",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-mot_de_passe");

    if (!admin) {
      return res.status(401).json({
        message: "Admin introuvable",
      });
    }

    if (!admin.actif) {
      return res.status(403).json({
        message: "Compte administrateur désactivé",
      });
    }

    req.admin = admin;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token invalide ou expiré",
    });
  }
};
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        message: "Admin non authentifié",
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        message: "Accès refusé, permissions insuffisantes",
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize
};
