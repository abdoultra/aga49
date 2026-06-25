const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsRoot = path.resolve(__dirname, "../../uploads");
const imagesDirectory = path.join(uploadsRoot, "images");
const documentsDirectory = path.join(uploadsRoot, "documents");

fs.mkdirSync(imagesDirectory, { recursive: true });
fs.mkdirSync(documentsDirectory, { recursive: true });

const mimeTypeExtensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    ".xlsx",
  "text/plain": ".txt",
};

const createStorage = (destination) =>
  multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, destination);
    },
    filename: (req, file, callback) => {
      const extension = mimeTypeExtensions[file.mimetype] || "";
      callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
    },
  });

const imageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const documentMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]);

const createFileFilter = (allowedMimeTypes, message) => (
  req,
  file,
  callback,
) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    const error = new Error(message);
    error.statusCode = 400;
    return callback(error);
  }

  callback(null, true);
};

const uploadImage = multer({
  storage: createStorage(imagesDirectory),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: createFileFilter(
    imageMimeTypes,
    "Format d'image non autorisé. Formats acceptés : JPEG, PNG, WebP et GIF",
  ),
});

const uploadDocument = multer({
  storage: createStorage(documentsDirectory),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: createFileFilter(
    documentMimeTypes,
    "Format de document non autorisé. Formats acceptés : PDF, Word, Excel et TXT",
  ),
});

module.exports = {
  uploadImage,
  uploadDocument,
};
