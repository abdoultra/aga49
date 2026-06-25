const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const mongoose = require("mongoose");
const createCorsOptions = require("./config/cors");
const adminRoutes = require("./routes/adminRoutes");
const memberRoutes = require("./routes/memberRoutes");
const membershipFeeRoutes = require("./routes/membershipFeeRoutes");
const publicationRoutes = require("./routes/publicationRoutes");
const albumRoutes = require("./routes/albumRoutes");
const photoRoutes = require("./routes/photoRoutes");
const documentRoutes = require("./routes/documentRoutes");
const contactMessageRoutes = require("./routes/contactMessageRoutes");
const { apiLimiter } = require("./middlewares/rateLimitMiddleware");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const createApp = (env) => {
  const app = express();

  if (env.trustProxy) {
    app.set("trust proxy", env.trustProxy);
  }

  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors(createCorsOptions(env.clientUrls)));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(apiLimiter);

  app.use(
    "/uploads/images",
    express.static(path.resolve(__dirname, "../uploads/images"), {
      maxAge: env.isProduction ? "1d" : 0,
    }),
  );

  app.get("/", (req, res) => {
    res.json({
      message: "API AGA fonctionne",
      environment: env.nodeEnv,
    });
  });

  app.get("/api/health", (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;

    return res.status(databaseConnected ? 200 : 503).json({
      status: databaseConnected ? "ok" : "degraded",
      database: databaseConnected ? "connected" : "disconnected",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/admin", adminRoutes);
  app.use("/api/members", memberRoutes);
  app.use("/api/membership-fees", membershipFeeRoutes);
  app.use("/api/publications", publicationRoutes);
  app.use("/api/albums", albumRoutes);
  app.use("/api/photos", photoRoutes);
  app.use("/api/documents", documentRoutes);
  app.use("/api/contact-messages", contactMessageRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
