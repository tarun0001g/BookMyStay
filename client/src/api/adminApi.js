// Local files
import { apiRequest } from './apiClient';

// Lists the signed-in administrator's homes.
export function getAdminHomes() {
  return apiRequest('/api/admin/homes');
}

// Creates a listing with its required image upload.
export function createAdminHome(values) {
  return apiRequest('/api/admin/homes', { method: 'POST', body: values });
}

// Updates an owned listing, optionally including a replacement image.
export function updateAdminHome(homeId, values) {
  return apiRequest(`/api/admin/homes/${encodeURIComponent(homeId)}`, {
    method: 'PUT',
    body: values,
  });
}

// Deletes an owned listing.
export function deleteAdminHome(homeId) {
  return apiRequest(`/api/admin/homes/${encodeURIComponent(homeId)}`, {
    method: 'DELETE',
  });
}
