// External modules
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Local modules
const cloudinary = require('./cloudinary');

const IMAGE_FORMATS = ['jpg', 'jpeg', 'png'];

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bookmystay',
    allowed_formats: IMAGE_FORMATS,
  },
});

// Exports the storage adapter used for listing photos.
module.exports = storage;
