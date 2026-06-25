const multer = require("multer");

const notFound = (req, res) => {
  return res.status(404).json({
    message: `Route introuvable : ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "Le fichier dépasse la taille maximale autorisée",
      LIMIT_FILE_COUNT: "Un seul fichier est autorisé",
      LIMIT_UNEXPECTED_FILE: "Le nom du champ fichier est incorrect",
    };

    return res.status(400).json({
      message: messages[error.code] || "Erreur lors de l'envoi du fichier",
    });
  }

  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error("Erreur non gérée :", error);
  }

  return res.status(statusCode).json({
    message:
      statusCode >= 500 && process.env.NODE_ENV === "production"
        ? "Erreur serveur"
        : error.message || "Erreur serveur",
  });
};

module.exports = {
  notFound,
  errorHandler,
};
