// React
import { useCallback, useEffect, useState } from 'react';

// Local files
import {
  createAdminHome,
  deleteAdminHome,
  getAdminHomes,
  updateAdminHome,
} from '../api/adminApi';
import { AdminHomeForm } from '../components/AdminHomeForm';
import { AdminHomeList } from '../components/AdminHomeList';
import { useToast } from '../context/ToastContext';

const EMPTY = {
  houseName: '',
  location: '',
  propertyType: 'other',
  guestCapacity: '2',
  amenities: [],
  price: '',
  rating: '5',
  description: '',
  photo: null,
};

// Lets administrators create, update, and remove their own listings.
export function AdminHomesPage() {
  const { showToast } = useToast();
  const [homes, setHomes] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(
    () => getAdminHomes().then((result) => setHomes(result.homes)),
    [],
  );
  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [load]);

  function startEdit(home) {
    setEditing(home._id);
    setForm({
      houseName: home.houseName,
      location: home.location,
      propertyType: home.propertyType || 'other',
      guestCapacity: String(home.guestCapacity || 2),
      amenities: home.amenities || [],
      price: home.price,
      rating: home.rating,
      description: home.description || '',
      photo: null,
    });
    document.getElementById('listing-form')?.scrollIntoView({ behavior: 'smooth' });
  }
  function retry() {
    setLoading(true);
    setError('');
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    const formElement = event.currentTarget;
    const values = new FormData(formElement);
    try {
      if (form.photo) values.set('photo', form.photo);
      const result = editing
        ? await updateAdminHome(editing, values)
        : await createAdminHome(values);
      setHomes((items) =>
        editing
          ? items.map((home) => (home._id === editing ? result.home : home))
          : [...items, result.home],
      );
      setForm(EMPTY);
      setEditing('');
      formElement.reset();
      showToast(editing ? 'Listing updated.' : 'Listing created.', {
        type: 'success',
      });
    } catch (err) {
      setErrors(err.errors || {});
      showToast(err.message, { type: 'error' });
    } finally {
      setSaving(false);
    }
  }
  async function remove(home) {
    if (!window.confirm(`Delete ${home.houseName}? This cannot be undone.`)) return;
    try {
      await deleteAdminHome(home._id);
      setHomes((items) => items.filter((item) => item._id !== home._id));
      showToast('Listing deleted.', { type: 'success' });
    } catch (err) {
      showToast(err.message, { type: 'error' });
    }
  }
  return (
    <main className="wrap page-main">
      <h1 tabIndex="-1">My listings</h1>
      <AdminHomeForm
        editing={editing}
        form={form}
        setForm={setForm}
        errors={errors}
        saving={saving}
        onSubmit={submit}
        onCancel={() => {
          setEditing('');
          setForm(EMPTY);
        }}
      />
      <h2>Your homes</h2>
      <AdminHomeList
        homes={homes}
        loading={loading}
        error={error}
        onRetry={retry}
        onEdit={startEdit}
        onDelete={remove}
      />
    </main>
  );
}
