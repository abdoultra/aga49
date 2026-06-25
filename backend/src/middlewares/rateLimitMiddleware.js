const { rateLimit } = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Trop de requêtes. Veuillez réessayer dans quelques minutes",
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    message: "Trop de tentatives de connexion. Réessayez dans 15 minutes",
  },
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message:
      "Trop de messages envoyés. Veuillez réessayer dans quelques minutes",
  },
});

module.exports = {
  apiLimiter,
  loginLimiter,
  contactLimiter,
};
