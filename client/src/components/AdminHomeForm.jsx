// Local files
import { FieldError } from './FieldError';

const propertyTypes = ['cottage', 'villa', 'farmhouse', 'apartment', 'other'];
const amenities = [
  ['wifi', 'Wi-Fi'],
  ['pool', 'Pool'],
  ['kitchen', 'Kitchen'],
  ['parking', 'Parking'],
  ['pet-friendly', 'Pet friendly'],
];

// Edits listing fields and uploads a photo for a new home.
export function AdminHomeForm({
  editing,
  form,
  setForm,
  errors,
  saving,
  onSubmit,
  onCancel,
}) {
  return (
    <form id="listing-form" className="auth-form listing-form" onSubmit={onSubmit}>
      <h2>{editing ? 'Edit listing' : 'Add a listing'}</h2>
      <label>
        Home name
        <input
          name="houseName"
          value={form.houseName}
          minLength="3"
          maxLength="100"
          required
          onChange={(e) => setForm({ ...form, houseName: e.target.value })}
        />
      </label>
      <FieldError message={errors.houseName} />
      <label>
        Location
        <input
          name="location"
          value={form.location}
          minLength="2"
          maxLength="100"
          required
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </label>
      <FieldError message={errors.location} />
      <label>
        Property type
        <select
          name="propertyType"
          value={form.propertyType}
          onChange={(event) => setForm({ ...form, propertyType: event.target.value })}
        >
          {propertyTypes.map((type) => (
            <option value={type} key={type}>
              {type === 'other' ? 'Other' : type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Guest capacity
        <input
          name="guestCapacity"
          type="number"
          min="1"
          max="16"
          value={form.guestCapacity}
          required
          onChange={(event) => setForm({ ...form, guestCapacity: event.target.value })}
        />
      </label>
      <FieldError message={errors.guestCapacity} />
      <fieldset className="amenity-options">
        <legend>Amenities</legend>
        {amenities.map(([value, label]) => (
          <label key={value}>
            <input
              name="amenities"
              type="checkbox"
              value={value}
              checked={form.amenities.includes(value)}
              onChange={(event) =>
                setForm({
                  ...form,
                  amenities: event.target.checked
                    ? [...form.amenities, value]
                    : form.amenities.filter((item) => item !== value),
                })
              }
            />
            {label}
          </label>
        ))}
      </fieldset>
      <FieldError message={errors.amenities} />
      <label>
        Price per night
        <input
          name="price"
          type="number"
          min="1"
          step="any"
          value={form.price}
          required
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
      </label>
      <FieldError message={errors.price} />
      <label>
        Rating
        <input
          name="rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={form.rating}
          required
          onChange={(e) => setForm({ ...form, rating: e.target.value })}
        />
      </label>
      <FieldError message={errors.rating} />
      <label>
        Description
        <textarea
          name="description"
          minLength="10"
          maxLength="1000"
          value={form.description}
          required
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>
      <FieldError message={errors.description} />
      <label>
        Photo {editing && '(optional replacement)'}
        <input
          name="photo"
          type="file"
          accept="image/jpeg,image/png"
          required={!editing}
          onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })}
        />
      </label>
      <FieldError message={errors.photo} />
      <div className="form-actions">
        <button className="primary-button" disabled={saving}>
          {saving ? 'Saving...' : editing ? 'Save changes' : 'Create listing'}
        </button>
        {editing && (
          <button className="secondary-button" type="button" onClick={onCancel}>
            Stop editing
          </button>
        )}
      </div>
    </form>
  );
}
