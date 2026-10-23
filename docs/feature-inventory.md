# BookMyStay feature inventory

This inventory describes the application's existing implementation after the redesign. It distinguishes working flows from ideas in the visual reference that require services or data the project does not currently have.

## Implemented

- Public homepage, property search, listing details, favourites, bookings, and admin listing management.
- Session based accounts with CSRF protection, protected API routes, and role protected listing management.
- Search by property name or location, date availability, guest capacity, price range, property type, amenities, minimum rating, sorting, and pagination.
- Property information stored on each listing: photo, location, nightly price, rating, description, type, guest capacity, and amenities.
- Booking date conflict checks, server calculated totals, and cancellation of eligible upcoming bookings.
- Responsive navigation, account menu, journal pages, and dismissing status toasts.

## Not currently implemented

- A public host onboarding or host application workflow. Listing management remains limited to accounts with the existing administrator role.
- Online payment processing, receipts, refunds, messaging, customer support, email newsletter subscriptions, or map search.
- A review system or verified host service. Ratings remain listing data managed through the existing admin listing form.
- A multi-image property gallery. The current listing model provides one property photo.
- Editorial content management. The Journal is a small local, read-only article collection.

The redesign avoids presenting unavailable services as active functionality. Implementing those items would require separate product and backend work.
