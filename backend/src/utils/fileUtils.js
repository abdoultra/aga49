const fs = require("fs/promises");
const path = require("path");

const uploadsRoot = path.resolve(__dirname, "../../uploads");

const getPublicFilePath = (file) => {
  const category = path.basename(path.dirname(file.path));
  return `/uploads/${category}/${file.filename}`;
};

const getAbsoluteUploadedPath = (publicPath) => {
  if (!publicPath || !publicPath.startsWith("/uploads/")) {
    return null;
  }

  const relativePath = publicPath.replace(/^\/uploads\//, "");
  const absolutePath = path.resolve(uploadsRoot, relativePath);
  const relativeToUploads = path.relative(uploadsRoot, absolutePath);

  if (
    relativeToUploads.startsWith("..") ||
    path.isAbsolute(relativeToUploads)
  ) {
    throw new Error("Chemin de fichier invalide");
  }

  return absolutePath;
};

const deleteUploadedFile = async (publicPath) => {
  const absolutePath = getAbsoluteUploadedPath(publicPath);

  if (!absolutePath) {
    return;
  }

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

module.exports = {
  uploadsRoot,
  getPublicFilePath,
  getAbsoluteUploadedPath,
  deleteUploadedFile,
};
