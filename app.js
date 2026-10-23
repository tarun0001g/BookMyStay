// Core modules
const path = require('path');
const fs = require('fs');

// Load environment variables from .env
require('dotenv').config({ quiet: true });

// External modules
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

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
        styleSrc: ["'self'"],
        scriptSrc: ["'self'"],
        upgradeInsecureRequests: null,
      },
    },
  }),
);

// Compress responses before serving static files or API responses.
app.use(compression());

// Parse request bodies only for API routes.
app.use('/api', express.json(), express.urlencoded({ extended: false }));

// Serve the built client without starting a session for public pages or assets.
const hasClientBuild = fs.existsSync(CLIENT_INDEX_PATH);
if (hasClientBuild && !isTest) {
  app.use(
    express.static(CLIENT_DIST_PATH, {
      maxAge: '1y',
      immutable: true,
      setHeaders(res, filePath) {
        if (filePath === CLIENT_INDEX_PATH) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    }),
  );
  app.get(/.*/, (req, res, next) => {
    if (req.originalUrl === '/health' || req.originalUrl.startsWith('/api/')) {
      return next();
    }

    res.setHeader('Cache-Control', 'no-cache');
    return res.sendFile(CLIENT_INDEX_PATH);
  });
} else if (!isProduction && !isTest) {
  // npm run dev runs Vite on 5173 while Express remains the API on 3007.
  app.get(/.*/, (req, res, next) => {
    if (req.originalUrl === '/health' || req.originalUrl.startsWith('/api/')) {
      return next();
    }
    if (req.accepts('html')) {
      return res.redirect(302, `http://localhost:5173${req.originalUrl}`);
    }
    return next();
  });
}

// Health check used by Render.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount session and CSRF middleware only where the API uses a session.
const sessionMiddleware = createSessionMiddleware({
  isTest,
  isProduction,
  mongoUrl: process.env.MONGO_URL,
  secret: process.env.SESSION_SECRET,
});
app.use(
  [
    '/api/csrf',
    '/api/auth',
    '/api/favourites',
    '/api/bookings',
    '/api/admin',
    '/api/homes/:homeId/rules',
  ],
  sessionMiddleware,
  csrf,
);

// Limits each login and signup route to 10 attempts in 15 minutes.
const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skip: () => isTest,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    sendError(res, 429, 'Too many login or signup attempts. Try again later.'),
});
app.use(['/api/auth/login', '/api/auth/signup'], authLimiter);

// The JSON API is the primary application interface.
app.use('/api', apiRouter);

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
      app.listen(PORT, () => {});
    })
    .catch((err) => {
      console.error('Database connection failed:', err);
      process.exitCode = 1;
    });
}

module.exports = app;
