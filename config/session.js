// Core modules

// External modules
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);

// Local modules

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

// Creates the shared session middleware with an isolated test store.
function createSessionMiddleware({ isTest, isProduction, mongoUrl, secret }) {
  const store = isTest
    ? new session.MemoryStore()
    : new MongoStore({ uri: mongoUrl, collection: 'sessions' });

  if (typeof store.on === 'function') {
    store.on('error', (error) => {
      console.error('Session store error:', error);
    });
  }

  return session({
    secret,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: SEVEN_DAYS,
    },
  });
}

module.exports = createSessionMiddleware;
