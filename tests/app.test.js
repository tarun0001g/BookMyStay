// Core modules
const http = require('http');

// External modules
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

// Local modules

// Keep uploads in memory so API tests never call Cloudinary.
jest.mock('../middleware/upload', () => {
  const multer = require('multer');
  const upload = multer({ storage: multer.memoryStorage() });
  const originalSingle = upload.single.bind(upload);

  upload.single = (fieldName) => (req, res, next) => {
    originalSingle(fieldName)(req, res, (error) => {
      if (req.file) {
        req.file.path = 'https://res.cloudinary.com/test/image/test.jpg';
        req.file.filename = 'bookmystay/test';
      }
      next(error);
    });
  };

  return upload;
});
jest.mock('../config/cloudinary', () => ({
  uploader: { destroy: jest.fn().mockResolvedValue({ result: 'ok' }) },
  config: jest.fn(),
}));

const User = require('../models/user');
const Home = require('../models/home');
const Booking = require('../models/booking');

const PASSWORD = 'Strong!Pass1';
const SESSION_SECRET = 'test-session-secret';
const TEST_DATABASE_NAME = 'bookmystay_api_test';
const TEST_TIMEOUT = 60000;

let mongoServer;
let app;
let server;
let guestAgent;
let adminAgent;
let guestUser;
let adminUser;

jest.setTimeout(TEST_TIMEOUT);

// Fetches a session token for the next API mutation.
async function getCsrfToken(agent) {
  const response = await agent.get('/api/csrf').expect(200);
  return response.body.csrfToken;
}

// Creates an account using the public signup endpoint.
async function signup(agent, email = 'guest@example.com') {
  const csrfToken = await getCsrfToken(agent);
  return agent
    .post('/api/auth/signup')
    .send({
      firstName: 'Guest',
      lastName: 'Tester',
      email,
      password: PASSWORD,
      confirmPassword: PASSWORD,
      terms: 'on',
    })
    .set('X-CSRF-Token', csrfToken);
}

// Logs in an agent using the current session's CSRF header.
async function login(agent, email, password = PASSWORD) {
  const csrfToken = await getCsrfToken(agent);
  return agent
    .post('/api/auth/login')
    .set('X-CSRF-Token', csrfToken)
    .send({ email, password });
}

// Creates a hashed account with an optional administrator role.
async function createUser(email, userType = 'guest') {
  return User.create({
    firstName: userType === 'admin' ? 'Admin' : 'Guest',
    lastName: 'Tester',
    email,
    password: await bcrypt.hash(PASSWORD, 10),
    userType,
  });
}

// Creates a home owned by the requested user.
async function createHome(owner, values = {}) {
  return Home.create({
    houseName: values.houseName || 'Cozy House',
    location: values.location || 'London',
    price: values.price || 100,
    rating: values.rating || 4,
    description: values.description || 'A comfortable place to stay.',
    photo: values.photo || 'https://res.cloudinary.com/test/image/test.jpg',
    owner: owner._id,
  });
}

// Formats a future local calendar day for booking requests.
function futureDate(daysAhead) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + daysAhead);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Initializes the test database, in-memory sessions, and API server.
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URL = mongoServer.getUri(TEST_DATABASE_NAME);
  process.env.SESSION_SECRET = SESSION_SECRET;
  process.env.NODE_ENV = 'test';

  app = require('../app');
  await mongoose.connect(process.env.MONGO_URL);
  server = http.createServer(app).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
});

// Clears test records and prepares independent logged-in agents.
beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Home.deleteMany({}), Booking.deleteMany({})]);
  guestAgent = request.agent(server);
  adminAgent = request.agent(server);
  guestUser = await createUser('guest@example.com');
  adminUser = await createUser('admin@example.com', 'admin');
});

// Releases database and server resources after the suite.
afterAll(async () => {
  await mongoose.disconnect();
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

test('signup, login, current user, bad credentials, and logout', async () => {
  const newAgent = request.agent(server);
  const signupResponse = await signup(newAgent, 'new@example.com');
  expect(signupResponse.status).toBe(201);
  expect(signupResponse.body.user.email).toBe('new@example.com');
  expect(signupResponse.body.user.password).toBeUndefined();

  const loginResponse = await login(newAgent, 'new@example.com');
  expect(loginResponse.status).toBe(200);
  expect(loginResponse.body.csrfToken).toBeTruthy();
  const currentUser = await newAgent.get('/api/auth/me').expect(200);
  expect(currentUser.body.user.email).toBe('new@example.com');

  const badAgent = request.agent(server);
  const badToken = await getCsrfToken(badAgent);
  const badLogin = await badAgent
    .post('/api/auth/login')
    .set('X-CSRF-Token', badToken)
    .send({ email: 'new@example.com', password: 'incorrect' })
    .expect(422);
  expect(badLogin.body.message).toBe('Invalid email or password.');
  expect(badLogin.body.errors.email).toBeTruthy();

  const logoutToken = await getCsrfToken(newAgent);
  await newAgent
    .post('/api/auth/logout')
    .set('X-CSRF-Token', logoutToken)
    .send({})
    .expect(200);
  await newAgent.get('/api/auth/me').expect(401);
});

test('authentication protects favourites, bookings, and admin routes by role', async () => {
  await guestAgent.get('/api/favourites').expect(401);
  await guestAgent.get('/api/bookings').expect(401);
  await guestAgent.get('/api/admin/homes').expect(401);

  expect((await login(guestAgent, guestUser.email)).status).toBe(200);
  const forbidden = await guestAgent.get('/api/admin/homes').expect(403);
  expect(forbidden.body.errors).toEqual({});
});

test('admin creates, edits, and deletes only owned homes', async () => {
  expect((await login(adminAgent, adminUser.email)).status).toBe(200);
  let csrfToken = await getCsrfToken(adminAgent);

  const created = await adminAgent
    .post('/api/admin/homes')
    .set('X-CSRF-Token', csrfToken)
    .field('houseName', 'Garden Flat')
    .field('location', 'Bristol')
    .field('price', '120')
    .field('rating', '4.5')
    .field('description', 'A quiet flat near the city centre.')
    .attach('photo', Buffer.from('test image'), 'flat.jpg')
    .expect(201);
  const homeId = created.body.home._id;
  expect(created.body.home.owner).toBe(adminUser._id.toString());

  const otherHome = await createHome(guestUser, { houseName: 'Private Home' });
  const homes = await adminAgent.get('/api/admin/homes').expect(200);
  expect(homes.body.homes.map((home) => home._id)).toContain(homeId);
  expect(homes.body.homes.map((home) => home._id)).not.toContain(
    otherHome._id.toString(),
  );

  csrfToken = await getCsrfToken(adminAgent);
  const updated = await adminAgent
    .put(`/api/admin/homes/${homeId}`)
    .set('X-CSRF-Token', csrfToken)
    .field('houseName', 'Garden Flat')
    .field('location', 'Bristol')
    .field('price', '175')
    .field('rating', '4.5')
    .field('description', 'A quiet flat near the city centre.')
    .expect(200);
  expect(updated.body.home.price).toBe(175);

  csrfToken = await getCsrfToken(adminAgent);
  await adminAgent
    .delete(`/api/admin/homes/${homeId}`)
    .set('X-CSRF-Token', csrfToken)
    .expect(200);
  expect(await Home.findById(homeId)).toBeNull();
});

test('home search and pagination return filtered page metadata', async () => {
  for (let index = 0; index < 14; index += 1) {
    await createHome(adminUser, {
      houseName: `Cozy Home ${index}`,
      location: index < 13 ? 'London' : 'Bath',
      price: 80 + index,
      rating: 4,
    });
  }

  const firstPage = await request(server)
    .get('/api/homes?q=London&minPrice=80&maxPrice=92&page=1')
    .expect(200)
    .expect((response) => {
      expect(response.headers['set-cookie']).toBeUndefined();
    });
  expect(firstPage.body.homes).toHaveLength(12);
  expect(firstPage.body.page).toBe(1);
  expect(firstPage.body.totalPages).toBe(2);
  expect(firstPage.body.homes[0]).toEqual(
    expect.objectContaining({ houseName: expect.any(String), photo: expect.any(String) }),
  );
  expect(firstPage.body.homes[0].owner).toBeUndefined();
  expect(firstPage.body.homes[0].description).toBeUndefined();

  const limited = await request(server).get('/api/homes?limit=4').expect(200);
  expect(limited.body.homes).toHaveLength(4);
  await request(server).get('/api/homes?limit=13').expect(422);

  const secondPage = await request(server)
    .get('/api/homes?q=London&minPrice=80&maxPrice=92&page=2')
    .expect(200);
  expect(secondPage.body.homes).toHaveLength(1);
  expect(secondPage.body.page).toBe(2);
});

test('favourites can be added and removed; invalid home ids return 404', async () => {
  const home = await createHome(adminUser);
  expect((await login(guestAgent, guestUser.email)).status).toBe(200);
  let csrfToken = await getCsrfToken(guestAgent);

  await guestAgent
    .post(`/api/favourites/${home._id}`)
    .set('X-CSRF-Token', csrfToken)
    .send({})
    .expect(200);
  const favourites = await guestAgent.get('/api/favourites').expect(200);
  expect(favourites.body.homes).toHaveLength(1);

  csrfToken = await getCsrfToken(guestAgent);
  await guestAgent
    .delete(`/api/favourites/${home._id}`)
    .set('X-CSRF-Token', csrfToken)
    .expect(200);
  expect((await guestAgent.get('/api/favourites')).body.homes).toHaveLength(0);

  csrfToken = await getCsrfToken(guestAgent);
  await guestAgent
    .post('/api/favourites/invalid-id')
    .set('X-CSRF-Token', csrfToken)
    .send({})
    .expect(404);
});

test('booking creation calculates price, rejects overlaps, and restricts cancellation', async () => {
  const home = await createHome(adminUser, { price: 100 });
  const checkIn = futureDate(5);
  const checkOut = futureDate(8);
  expect((await login(guestAgent, guestUser.email)).status).toBe(200);

  const created = await guestAgent
    .post('/api/bookings')
    .set('X-CSRF-Token', await getCsrfToken(guestAgent))
    .send({ homeId: home._id, checkIn, checkOut, guests: 2 })
    .expect(201);
  const bookingId = created.body.booking._id;
  expect(created.body.booking.nights).toBe(3);
  expect(created.body.booking.totalPrice).toBe(300);

  await guestAgent
    .post('/api/bookings')
    .set('X-CSRF-Token', await getCsrfToken(guestAgent))
    .send({ homeId: home._id, checkIn, checkOut, guests: 1 })
    .expect(409);

  const otherAgent = request.agent(server);
  expect((await login(otherAgent, adminUser.email)).status).toBe(200);
  await otherAgent
    .post(`/api/bookings/${bookingId}/cancel`)
    .set('X-CSRF-Token', await getCsrfToken(otherAgent))
    .send({})
    .expect(404);

  await guestAgent
    .post(`/api/bookings/${bookingId}/cancel`)
    .set('X-CSRF-Token', await getCsrfToken(guestAgent))
    .send({})
    .expect(200);
  expect((await Booking.findById(bookingId)).status).toBe('cancelled');
});

test('simultaneous overlapping booking requests create only one booking', async () => {
  const home = await createHome(adminUser, { price: 100 });
  const otherGuest = await createUser('second-guest@example.com');
  const otherAgent = request.agent(server);
  await Promise.all([
    login(guestAgent, guestUser.email),
    login(otherAgent, otherGuest.email),
  ]);
  const checkIn = futureDate(10);
  const checkOut = futureDate(12);
  const requests = await Promise.all([
    guestAgent
      .post('/api/bookings')
      .set('X-CSRF-Token', await getCsrfToken(guestAgent))
      .send({ homeId: home._id, checkIn, checkOut, guests: 1 }),
    otherAgent
      .post('/api/bookings')
      .set('X-CSRF-Token', await getCsrfToken(otherAgent))
      .send({ homeId: home._id, checkIn, checkOut, guests: 1 }),
  ]);

  expect(requests.map((response) => response.status).sort()).toEqual([201, 409]);
  expect(await Booking.countDocuments({ home: home._id, status: 'confirmed' })).toBe(1);
});

test('invalid resource ids and unknown API routes return JSON 404 errors', async () => {
  const csrfError = await request(server).post('/api/auth/logout').send({}).expect(403);
  expect(csrfError.body).toEqual({
    message: 'Invalid security token.',
    errors: {},
  });

  const invalidHome = await request(server).get('/api/homes/not-an-id').expect(404);
  expect(invalidHome.body).toEqual({ message: 'Home not found.', errors: {} });

  const missingRoute = await request(server).get('/api/not-a-route').expect(404);
  expect(missingRoute.body).toEqual({ message: 'API route not found.', errors: {} });

  const invalidPage = await request(server).get('/api/homes?page=0').expect(422);
  expect(invalidPage.body.errors.page).toBeTruthy();

  expect((await login(guestAgent, guestUser.email)).status).toBe(200);
  await guestAgent
    .post('/api/bookings')
    .set('X-CSRF-Token', await getCsrfToken(guestAgent))
    .send({
      homeId: 'not-an-id',
      checkIn: futureDate(3),
      checkOut: futureDate(4),
      guests: 1,
    })
    .expect(404);
});
