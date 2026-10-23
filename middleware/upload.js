// External modules
const multer = require('multer');

// Local modules
const cloudinaryStorage = require('../config/cloudinaryStorage');

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Exports the upload middleware for listing photos.
module.exports = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter(req, file, cb) {
    cb(null, /^image\/(jpeg|png)$/.test(file.mimetype));
  },
});
