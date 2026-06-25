require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const loadEnv = require("./config/env");
const createApp = require("./app");

const startServer = async () => {
  const env = loadEnv();
  await connectDB(env.mongoUri);

  const app = createApp(env);
  const server = app.listen(env.port, env.host, () => {
    console.log(
      `API AGA démarrée sur ${env.host}:${env.port} en mode ${env.nodeEnv}`,
    );
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  server.requestTimeout = 30000;

  const shutdown = async (signal) => {
    console.log(`${signal} reçu, arrêt du serveur...`);

    server.close(async () => {
      await mongoose.connection.close();
      console.log("Serveur et connexion MongoDB arrêtés proprement");
      process.exit(0);
    });

    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer().catch((error) => {
  console.error("Impossible de démarrer l'API :", error.message);
  process.exit(1);
});
