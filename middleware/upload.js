const multer = require('multer');

const cloudinaryStorage = require('../config/cloudinaryStorage');

module.exports = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    cb(null, /^image\/(jpeg|png)$/.test(file.mimetype));
  },
});
