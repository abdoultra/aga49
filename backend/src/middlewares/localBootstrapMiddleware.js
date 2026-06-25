const isLoopbackAddress = (address = "") =>
  ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(address);

const localBootstrapOnly = (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ message: "Route introuvable" });
  }

  if (!isLoopbackAddress(req.socket.remoteAddress)) {
    return res.status(403).json({
      message: "L'amorçage est autorisé uniquement depuis la machine locale",
    });
  }

  return next();
};

module.exports = localBootstrapOnly;
