// Local files
import { FieldError } from './FieldError';

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
