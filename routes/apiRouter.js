// Core modules

// External modules
const express = require('express');

// Local modules
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const storeController = require('../controllers/storeController');
const isAuth = require('../middleware/isAuth');
const isAdmin = require('../middleware/isAdmin');
const upload = require('../middleware/upload');
const { sendError } = require('../utility/apiResponse');

const router = express.Router();

// Uploads one listing image and converts Multer errors to API responses.
function uploadPhoto(req, res, next) {
  upload.single('photo')(req, res, (error) => {
    if (!error) {
      return next();
    }

    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Photo must be 5 MB or smaller.'
        : 'Upload a JPG or PNG photo.';
    return sendError(res, 422, message, { photo: message });
  });
}

// Provides the CSRF token before the client makes a state-changing request.
router.get('/csrf', authController.getCsrfToken);

// Account endpoints use the API session cookie.
router.get('/auth/me', authController.getCurrentUser);
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.post('/auth/logout', isAuth, authController.logout);

// Public listing and protected booking resources.
router.get('/homes', storeController.getHomes);
router.get('/homes/:homeId/rules', isAuth, storeController.getHouseRules);
router.get('/homes/:homeId', storeController.getHome);
router.get('/favourites', isAuth, storeController.getFavourites);
router.post('/favourites/:homeId', isAuth, storeController.addFavourite);
router.delete('/favourites/:homeId', isAuth, storeController.removeFavourite);
router.get('/bookings', isAuth, storeController.getBookings);
router.post('/bookings', isAuth, storeController.createBooking);
router.post('/bookings/:bookingId/cancel', isAuth, storeController.cancelBooking);

// Admin routes enforce both authentication and the admin role.
router.use('/admin', isAuth, isAdmin);
router.get('/admin/homes', adminController.getAdminHomes);
router.post('/admin/homes', uploadPhoto, adminController.createHome);
router.put('/admin/homes/:homeId', uploadPhoto, adminController.updateHome);
router.delete('/admin/homes/:homeId', adminController.deleteHome);

// Converts unmatched API paths to the same JSON error format.
router.use((req, res) => sendError(res, 404, 'API route not found.'));

module.exports = router;
