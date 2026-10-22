// Core modules
const path = require('path');

// External modules
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

// Local modules
const Booking = require('../models/booking');
const Home = require('../models/home');
const User = require('../models/user');
const { sendError, validationErrors } = require('../utility/apiResponse');
const {
  isFutureCheckIn,
  isValidBooking,
  parseBookingDates,
} = require('../utility/bookingUtility');
const bookingValidator = require('../validators/bookingValidator');
const homeSearchValidator = require('../validators/homeSearchValidator');
const PAGE_SIZE = 12;
const RULES_PATH = path.join(__dirname, '../rules/BookMyStay_Rules.pdf');

// Lists homes matching search filters through GET /api/homes.
exports.getHomes = [
  ...homeSearchValidator,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(
        res,
        422,
        'Please correct the search filters.',
        validationErrors(errors),
      );
    }

    try {
      const filter = createHomeFilter(req.query);
      const page = parsePage(req.query.page);
      const sort = req.query.sort === 'rating' ? { rating: -1 } : { price: 1 };
      const [homes, total] = await Promise.all([
        Home.find(filter)
          .sort(sort)
          .skip((page - 1) * PAGE_SIZE)
          .limit(PAGE_SIZE),
        Home.countDocuments(filter),
      ]);

      return res.status(200).json({
        homes,
        page,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      });
    } catch (error) {
      return next(error);
    }
  },
];

// Returns a single home through GET /api/homes/:homeId.
exports.getHome = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.homeId)) {
      return sendError(res, 404, 'Home not found.');
    }

    const home = await Home.findById(req.params.homeId);
    if (!home) {
      return sendError(res, 404, 'Home not found.');
    }

    return res.status(200).json({ home });
  } catch (error) {
    return next(error);
  }
};

// Downloads house rules for GET /api/homes/:homeId/rules.
exports.getHouseRules = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.homeId)) {
      return sendError(res, 404, 'Home not found.');
    }

    const home = await Home.findById(req.params.homeId);
    if (!home) {
      return sendError(res, 404, 'Home not found.');
    }

    const filename = `${home.houseName.replace(/[^a-z0-9]+/gi, '-')}-rules.pdf`;
    return res.download(RULES_PATH, filename);
  } catch (error) {
    return next(error);
  }
};

// Lists the signed-in user's favourites through GET /api/favourites.
exports.getFavourites = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user._id).populate('favourites');
    return res.status(200).json({ homes: user?.favourites || [] });
  } catch (error) {
    return next(error);
  }
};

// Adds a home to favourites through POST /api/favourites/:homeId.
exports.addFavourite = async (req, res, next) => {
  try {
    const home = await findHome(req.params.homeId);
    if (!home) {
      return sendError(res, 404, 'Home not found.');
    }

    await User.updateOne(
      { _id: req.session.user._id },
      { $addToSet: { favourites: home._id } },
    );

    return res.status(200).json({ message: 'Home added to favourites.' });
  } catch (error) {
    return next(error);
  }
};

// Removes a home from favourites through DELETE /api/favourites/:homeId.
exports.removeFavourite = async (req, res, next) => {
  try {
    const home = await findHome(req.params.homeId);
    if (!home) {
      return sendError(res, 404, 'Home not found.');
    }

    await User.updateOne(
      { _id: req.session.user._id },
      { $pull: { favourites: home._id } },
    );

    return res.status(200).json({ message: 'Home removed from favourites.' });
  } catch (error) {
    return next(error);
  }
};

// Lists the signed-in user's bookings through GET /api/bookings.
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.session.user._id })
      .populate('home')
      .sort({ checkIn: 1 });
    return res.status(200).json({ bookings });
  } catch (error) {
    return next(error);
  }
};

// Creates a priced, date-checked booking through POST /api/bookings.
exports.createBooking = [
  ...bookingValidator,
  async (req, res, next) => {
    const validationResultData = validationResult(req);
    if (!validationResultData.isEmpty()) {
      return sendError(
        res,
        422,
        'Please enter valid booking details.',
        validationResultData.array().reduce((errors, error) => {
          if (!errors[error.path]) {
            errors[error.path] = 'Enter valid booking details.';
          }
          return errors;
        }, {}),
      );
    }

    try {
      const { homeId, checkIn, checkOut, guests } = req.body;
      const home = await findHome(homeId);
      if (!home) {
        return sendError(res, 404, 'Home not found.', { homeId: 'Home not found.' });
      }

      const dates = parseBookingDates(checkIn, checkOut);
      const guestCount = Number(guests);
      if (!dates || !isValidBooking(dates)) {
        return sendError(res, 422, 'Please enter valid booking details.', {
          dates: 'Choose valid dates up to 30 nights in the future.',
          guests: 'Enter at least one guest.',
        });
      }

      const overlap = await Booking.exists({
        home: home._id,
        status: 'confirmed',
        checkIn: { $lt: dates.end },
        checkOut: { $gt: dates.start },
      });
      if (overlap) {
        return sendError(res, 409, 'Those dates are already booked.');
      }

      const booking = await Booking.create({
        user: req.session.user._id,
        home: home._id,
        checkIn: dates.start,
        checkOut: dates.end,
        guests: guestCount,
        nights: dates.nights,
        totalPrice: dates.nights * home.price,
      });

      return res.status(201).json({ booking });
    } catch (error) {
      return next(error);
    }
  },
];

// Cancels only the current user's future booking through the cancel route.
exports.cancelBooking = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.bookingId)) {
      return sendError(res, 404, 'Booking not found.');
    }

    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      user: req.session.user._id,
      status: 'confirmed',
    });
    if (!booking || !isFutureCheckIn(booking.checkIn)) {
      return sendError(res, 404, 'Booking not found or cannot be cancelled.');
    }

    booking.status = 'cancelled';
    await booking.save();
    return res.status(200).json({ booking });
  } catch (error) {
    return next(error);
  }
};

// Builds validated search filters from the query string.
function createHomeFilter(query) {
  const filter = {};
  const search = String(query.q || '').trim();
  const minPrice = Number(query.minPrice);
  const maxPrice = Number(query.maxPrice);

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { houseName: new RegExp(escaped, 'i') },
      { location: new RegExp(escaped, 'i') },
    ];
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (Number.isFinite(minPrice)) {
      filter.price.$gte = minPrice;
    }
    if (Number.isFinite(maxPrice)) {
      filter.price.$lte = maxPrice;
    }
  }

  return filter;
}

// Parses a safe positive page number for listings.
function parsePage(value) {
  const page = Number.parseInt(value, 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

// Finds a home only when its supplied identifier is valid.
function findHome(homeId) {
  if (!mongoose.isValidObjectId(homeId)) {
    return null;
  }

  return Home.findById(homeId);
}
