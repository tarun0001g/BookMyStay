// Core modules

// External modules
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

// Local modules
const cloudinary = require('../config/cloudinary');
const Home = require('../models/home');
const homeValidator = require('../validators/homeValidator');
const { sendError, validationErrors } = require('../utility/apiResponse');

// Lists the current administrator's homes through GET /api/admin/homes.
exports.getAdminHomes = async (req, res, next) => {
  try {
    const homes = await Home.find({ owner: req.session.user._id })
      .sort({ houseName: 1 })
      .lean();
    return res.status(200).json({ homes });
  } catch (error) {
    return next(error);
  }
};

// Validates and creates an owned home through POST /api/admin/homes.
exports.createHome = [
  ...homeValidator,
  async (req, res, next) => {
    const validationResultData = validationResult(req);
    if (!validationResultData.isEmpty()) {
      return sendError(
        res,
        422,
        'Please correct the highlighted fields.',
        validationErrors(validationResultData),
      );
    }
    if (!req.file) {
      return sendError(res, 422, 'A JPG or PNG photo is required.', {
        photo: 'A JPG or PNG photo is required.',
      });
    }

    try {
      const home = await Home.create(homeData(req, req.file));
      return res.status(201).json({ home });
    } catch (error) {
      return next(error);
    }
  },
];

// Validates and updates an owned home through PUT /api/admin/homes/:homeId.
exports.updateHome = [
  ...homeValidator,
  async (req, res, next) => {
    const validationResultData = validationResult(req);
    if (!validationResultData.isEmpty()) {
      return sendError(
        res,
        422,
        'Please correct the highlighted fields.',
        validationErrors(validationResultData),
      );
    }

    try {
      if (!mongoose.isValidObjectId(req.params.homeId)) {
        return sendError(res, 404, 'Home not found.');
      }

      const home = await Home.findOne({
        _id: req.params.homeId,
        owner: req.session.user._id,
      });
      if (!home) {
        return sendError(res, 404, 'Home not found.');
      }

      const previousPhotoId = home.photoPublicId;
      Object.assign(home, homeData(req, req.file));
      await home.save();
      if (req.file && previousPhotoId) {
        await destroyPhoto(previousPhotoId);
      }

      return res.status(200).json({ home });
    } catch (error) {
      return next(error);
    }
  },
];

// Deletes only an owned home through DELETE /api/admin/homes/:homeId.
exports.deleteHome = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.homeId)) {
      return sendError(res, 404, 'Home not found.');
    }

    const home = await Home.findOneAndDelete({
      _id: req.params.homeId,
      owner: req.session.user._id,
    });
    if (!home) {
      return sendError(res, 404, 'Home not found.');
    }
    if (home.photoPublicId) {
      await destroyPhoto(home.photoPublicId);
    }

    return res.status(200).json({ message: 'Home deleted.' });
  } catch (error) {
    return next(error);
  }
};

// Creates the schema fields shared by home creation and updates.
function homeData(req, file) {
  const data = {
    houseName: req.body.houseName,
    location: req.body.location,
    price: Number(req.body.price),
    rating: Number(req.body.rating),
    description: req.body.description,
  };

  if (file) {
    data.photo = file.path;
    data.photoPublicId = file.filename || file.public_id;
  }
  if (!req.params.homeId) {
    data.owner = req.session.user._id;
  }

  return data;
}

// Removes an uploaded image while keeping the API response usable on failure.
async function destroyPhoto(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Could not delete a Cloudinary image:', error.message);
  }
}
