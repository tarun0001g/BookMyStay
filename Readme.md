# BookMyStay

BookMyStay is a React single page app backed by an Express 5 JSON API and MongoDB. Cloudinary stores listing images. Guests can browse homes, save favourites, and book stays; administrators manage their own listings.

## Screenshots

Screenshots are in `screenshots/`. Please replace them with current captures when convenient.

## Project structure

```text
client/       React app, Vite config, and client tests
  src/        API clients, components, contexts, pages, routes, styles, utilities
config/       MongoDB, Cloudinary, and session configuration
controllers/  API request handlers
middleware/   Authentication, CSRF protection, and uploads
models/       User, Home, and Booking schemas
routes/       JSON API endpoints
scripts/      Admin account and home owner utilities
tests/        Jest and Supertest API tests
utility/      Shared response and booking helpers
validators/   Request validation chains
rules/        House rules PDF
screenshots/  Reference screenshots
app.js        Express setup and server entry point
package.json  Application scripts and dependencies
Readme.md     Project documentation
```

## Setup and scripts

Install Node.js dependencies with `npm install`, then copy `.env.example` to `.env` and configure its values. The server requires `MONGO_URL` and `SESSION_SECRET`; Cloudinary settings are needed for listing uploads.

Use `npm run dev` to run Express and Vite during development. `npm run build` creates the production client, and `npm start` starts the server. The `/health` endpoint returns `{ "status": "ok" }`.

- `npm start`: start the server
- `npm run dev`: run Express and Vite
- `npm run build`: create the Vite production build
- `npm test`: run Jest API tests and Vitest client tests
- `npm run lint`: run ESLint
- `npm run format`: format JavaScript, JSX, JSON, Markdown, and CSS files
- `npm run format:check`: check formatting

Create an administrator with `node scripts/createAdmin.js admin@example.com 'StrongPassword'`. Existing homes can be assigned to that administrator with `node scripts/assignOwner.js admin@example.com`.

## Bookings

Guests can reserve a home from its detail page. Check-in must be today or later, checkout must follow check-in, and a stay can be at most 30 nights. The server calculates the total using the current nightly price and rejects overlapping confirmed bookings. A guest can cancel their own future booking.

## API and access control

The JSON API is mounted under `/api`. Fetch `/api/csrf` and send the returned `csrfToken` in the `X-CSRF-Token` header on every `POST`, `PUT`, and `DELETE` request. After login, use the rotated token returned by the login response.

| Method | Endpoint                                               | Access           | Result                                       |
| ------ | ------------------------------------------------------ | ---------------- | -------------------------------------------- |
| GET    | `/api/csrf`                                            | Public           | Session CSRF token                           |
| GET    | `/api/auth/me`                                         | Signed in        | Current user, or 401                         |
| POST   | `/api/auth/signup`                                     | Public           | Creates a guest account                      |
| POST   | `/api/auth/login`                                      | Public           | Starts a session                             |
| POST   | `/api/auth/logout`                                     | Signed in        | Ends the session                             |
| GET    | `/api/homes?q=&minPrice=&maxPrice=&sort=&page=&limit=` | Public           | Homes and page metadata; maximum 12 per page |
| GET    | `/api/homes/:homeId`                                   | Public           | One home                                     |
| GET    | `/api/homes/:homeId/rules`                             | Signed in        | House rules PDF                              |
| GET    | `/api/favourites`                                      | Signed in        | Current user's favourite homes               |
| POST   | `/api/favourites/:homeId`                              | Signed in        | Adds a favourite                             |
| DELETE | `/api/favourites/:homeId`                              | Signed in        | Removes a favourite                          |
| GET    | `/api/bookings`                                        | Signed in        | Current user's bookings                      |
| POST   | `/api/bookings`                                        | Signed in        | Creates a booking                            |
| POST   | `/api/bookings/:bookingId/cancel`                      | Booking owner    | Cancels a future booking                     |
| GET    | `/api/admin/homes`                                     | Admin            | Lists the admin's homes                      |
| POST   | `/api/admin/homes`                                     | Admin            | Creates a home with a photo upload           |
| PUT    | `/api/admin/homes/:homeId`                             | Home owner admin | Updates a home                               |
| DELETE | `/api/admin/homes/:homeId`                             | Home owner admin | Deletes a home                               |

API errors use a consistent JSON response with a message and field-keyed errors. The API uses 401 for unauthenticated requests, 403 for forbidden requests, 404 for missing resources, 409 for overlapping bookings, 422 for invalid input, and 500 for unexpected errors.

## Render deployment

Set the values from `.env.example` in Render. Use build command `npm install --include=dev && npm run build` and start command `npm start`. Configure MongoDB Atlas network access and Cloudinary credentials for the deployed service.

## Code style and tests

Run `npm run format`, `npm run lint`, and `npm test` before committing. Tests use Jest, Supertest, and mongodb-memory-server for the API, plus Vitest for the client.

Reviews, payments, email verification, and an availability calendar are not implemented.
