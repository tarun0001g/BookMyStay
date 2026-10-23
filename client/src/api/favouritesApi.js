// React

// External libraries

// Local files
import { apiRequest } from './apiClient';

// Lists the signed-in user's saved homes.
export function getFavourites() {
  return apiRequest('/api/favourites');
}

// Saves a home to the signed-in user's favourites.
export function addFavourite(homeId) {
  return apiRequest(`/api/favourites/${encodeURIComponent(homeId)}`, {
    method: 'POST',
    body: {},
  });
}

// Removes a home from the signed-in user's favourites.
export function removeFavourite(homeId) {
  return apiRequest(`/api/favourites/${encodeURIComponent(homeId)}`, {
    method: 'DELETE',
  });
}
