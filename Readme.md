# BookMyStay

BookMyStay is an Express 5 and MongoDB JSON API for browsing homes, saving favourites, booking stays, and managing listings. Cloudinary stores listing images. Legacy EJS templates remain in `views/` for the client transition.

## Screenshots

Screenshots are in `screenshots/`. They may need to be refreshed to reflect the current UI.

## Stack and access control

The app uses Node.js, Express 5, Mongoose, MongoDB, express-session, bcryptjs, Multer, and Cloudinary. It has guest and admin roles. `isAuth` protects signed-in API routes and `isAdmin` restricts admin endpoints.

## Project structure

```text
config/       Database, Cloudinary, and session configuration
controllers/  JSON API handlers for auth, admin, and stay resources
middleware/   Authentication, CSRF protection, and upload handling
models/       User, Home, and Booking schemas
routes/       JSON API endpoint definitions
scripts/      Admin account creation and home-owner migration tools
tests/        Jest and Supertest application tests
utility/      Shared file and domain helper functions
validators/   Signup and home form validation chains
views/        Retained EJS templates for the client transition
public/       Tailwind source and generated CSS assets
rules/        Shared house rules PDF
screenshots/  Application screenshots
app.js        Express setup, middleware order, and server entry point
package.json  Application scripts and dependencies
Readme.md     Setup, project structure, and usage documentation
```

## Setup

Install Node.js dependencies with `npm install`, then copy `.env.example` to `.env` and set each value. Required variables are `MONGO_URL`, `SESSION_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NODE_ENV`, and `PORT`.

Run `npm run build:css` to generate styles. Use `npm run dev` during development or `npm start` to start the server. The `/health` endpoint returns `{ "status": "ok" }`.

Create an administrator with `node scripts/createAdmin.js admin@example.com 'StrongPassword'`. The script creates or promotes that account. For existing listings, run `node scripts/assignOwner.js admin@example.com` once to assign homes to that admin.

## Bookings

Guests can reserve a home from its detail page. Check-in must be today or later, checkout must follow check-in, and a stay can be at most 30 nights. The server calculates the total using the current nightly price and rejects overlapping confirmed bookings. A guest can cancel their own future booking.

## Scripts

- `npm start`: start the production server
- `npm run dev`: run nodemon and Tailwind watch
- `npm run build:css`: create minified CSS
- `npm test`: run Jest integration tests
- `npm run lint`: run ESLint
- `npm run format`: format JavaScript, JSON, and Markdown files
- `npm run format:check`: check formatting without writing files

## Code style

`config/` contains service setup, `middleware/` contains request-wide concerns,
`models/` defines database schemas, `validators/` defines form rules,
`controllers/` handles requests, and `routes/` maps URLs to middleware and
handlers. Requires are grouped under `// Core modules`, `// External modules`,
and `// Local modules` comments. Run `npm run format` and `npm run lint` before
committing changes.

## Tests

Run `npm test`. Tests use Jest, Supertest, and mongodb-memory-server. Uploads use in-memory storage and Cloudinary is mocked.

## JSON API

The API uses session cookies and is mounted under `/api`. Fetch `/api/csrf`
once per session and send its `csrfToken` in the `X-CSRF-Token` header on
every `POST`, `PUT`, and `DELETE` request. This includes multipart home uploads.
After login, replace the stored token with the `csrfToken` returned by the
login response because authentication rotates the session token.

| Method | Endpoint                                        | Access           | Result                                    |
| ------ | ----------------------------------------------- | ---------------- | ----------------------------------------- |
| GET    | `/api/csrf`                                     | Public           | Session CSRF token                        |
| GET    | `/api/auth/me`                                  | Signed in        | Current user, or 401                      |
| POST   | `/api/auth/signup`                              | Public           | Creates a guest account (201)             |
| POST   | `/api/auth/login`                               | Public           | Starts a session                          |
| POST   | `/api/auth/logout`                              | Signed in        | Ends the session                          |
| GET    | `/api/homes?q=&minPrice=&maxPrice=&sort=&page=` | Public           | Homes, page, and totalPages (12 per page) |
| GET    | `/api/homes/:homeId`                            | Public           | One home                                  |
| GET    | `/api/homes/:homeId/rules`                      | Signed in        | House rules PDF                           |
| GET    | `/api/favourites`                               | Signed in        | Current user's favourite homes            |
| POST   | `/api/favourites/:homeId`                       | Signed in        | Adds a favourite                          |
| DELETE | `/api/favourites/:homeId`                       | Signed in        | Removes a favourite                       |
| GET    | `/api/bookings`                                 | Signed in        | Current user's bookings                   |
| POST   | `/api/bookings`                                 | Signed in        | Creates a booking                         |
| POST   | `/api/bookings/:bookingId/cancel`               | Booking owner    | Cancels a future booking                  |
| GET    | `/api/admin/homes`                              | Admin            | Lists the admin's own homes               |
| POST   | `/api/admin/homes`                              | Admin            | Creates a home with a `photo` upload      |
| PUT    | `/api/admin/homes/:homeId`                      | Home owner admin | Updates a home; photo is optional         |
| DELETE | `/api/admin/homes/:homeId`                      | Home owner admin | Deletes an owned home                     |

API errors use the same JSON shape. Validation errors map field names to
messages; authorization and not-found errors have an empty `errors` object.

```json
{
  "message": "Please correct the highlighted fields.",
  "errors": {
    "email": "Enter a valid email address."
  }
}
```

The API uses 401 for unauthenticated requests, 403 for forbidden requests,
404 for missing resources or routes, 409 for overlapping bookings, 422 for
invalid input, and 500 for unexpected errors. EJS templates remain in
`views/` for the planned client transition, but the server now serves JSON
routes under `/api`.

## Render deployment

Set the environment variables listed in `.env.example` in Render. Use build command `npm install && npm run build:css` and start command `npm start`. Configure MongoDB Atlas network access and Cloudinary credentials for the deployed service.

## Current gaps

Reviews, payments, email verification, and an availability calendar are not implemented.
