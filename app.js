// Core modules
const path = require('path');
const fs = require('fs');

// Load environment variables from .env
require('dotenv').config({ quiet: true });

// External modules
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Local modules
const connectDB = require('./config/db');
const createSessionMiddleware = require('./config/session');
const apiRouter = require('./routes/apiRouter');
const csrf = require('./middleware/csrf');
const { sendError } = require('./utility/apiResponse');

// Settings
const PORT = process.env.PORT || 3007;
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const FIFTEEN_MINUTES = 15 * 60 * 1000;
const CLIENT_DIST_PATH = path.join(__dirname, 'client', 'dist');
const CLIENT_INDEX_PATH = path.join(CLIENT_DIST_PATH, 'index.html');

// Fail early if a required setting is missing
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required');
}
if (!process.env.MONGO_URL) {
  throw new Error('MONGO_URL is required');
}

const app = express();

// Render runs behind a proxy, so trust it to get secure cookies working
if (isProduction) {
  app.set('trust proxy', 1);
}

// Security headers: allow our own files plus Cloudinary images
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        upgradeInsecureRequests: null,
      },
    },
  }),
);

// Static files and form parsing
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check used by Render
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MongoDB stores production sessions; tests use a memory store.
app.use(
  createSessionMiddleware({
    isTest,
    isProduction,
    mongoUrl: process.env.MONGO_URL,
    secret: process.env.SESSION_SECRET,
  }),
);

// CSRF protection guards every state-changing API request.
app.use(csrf);

// Limits each login and signup route to 10 attempts in 15 minutes.
const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    sendError(res, 429, 'Too many login or signup attempts. Try again later.'),
});
app.use(['/api/auth/login', '/api/auth/signup'], authLimiter);

// The JSON API is the primary application interface.
app.use('/api', apiRouter);

// Serve the client when a production build has been created.
const hasProductionClient = isProduction && fs.existsSync(CLIENT_INDEX_PATH);
if (hasProductionClient) {
  app.use(express.static(CLIENT_DIST_PATH));
  app.get(/.*/, (req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
      return next();
    }

    return res.sendFile(CLIENT_INDEX_PATH);
  });
}

// Unmatched routes return a consistent JSON error response.
app.use((req, res) => {
  return res.status(404).json({ message: 'Route not found.', errors: {} });
});

// Error handler: runs when a route throws or calls next(err)
app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status = Number.isInteger(err.status) ? err.status : 500;
  return res.status(status).json({
    message: status >= 500 ? 'An unexpected error occurred.' : err.message,
    errors: err.errors || {},
  });
});

// Connect to MongoDB first, then start the server.
// This block is skipped when the tests import the app.
if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log('Connected with MongoDB');
        console.log(`BookMyStay is running at http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Database connection failed:', err);
      process.exitCode = 1;
    });
}

module.exports = app;
