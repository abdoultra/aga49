const parsePositiveInteger = (value, fallback, name) => {
  const parsedValue = Number.parseInt(value ?? fallback, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${name} doit être un entier positif`);
  }

  return parsedValue;
};

const requireVariable = (name) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Variable d'environnement obligatoire manquante : ${name}`);
  }

  return value;
};

const loadEnv = () => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const mongoUri = requireVariable("MONGO_URI");
  const jwtSecret = requireVariable("JWT_SECRET");
  const clientUrls = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean);

  if (nodeEnv === "production" && jwtSecret.length < 32) {
    throw new Error("JWT_SECRET doit contenir au moins 32 caractères");
  }

  if (nodeEnv === "production" && !process.env.CLIENT_URL?.trim()) {
    throw new Error("CLIENT_URL est obligatoire en production");
  }

  return {
    nodeEnv,
    isProduction: nodeEnv === "production",
    host: process.env.HOST?.trim() || "127.0.0.1",
    port: parsePositiveInteger(process.env.PORT, 5000, "PORT"),
    mongoUri,
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    clientUrls,
    trustProxy: /^\d+$/.test(process.env.TRUST_PROXY || "")
      ? Number(process.env.TRUST_PROXY)
      : process.env.TRUST_PROXY || "",
  };
};

module.exports = loadEnv;
