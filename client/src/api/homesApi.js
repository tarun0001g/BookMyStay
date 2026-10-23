// React

// External libraries

// Local files
import { apiRequest } from './apiClient';

// Fetches a page of homes using the current search parameters.
export function getHomes(searchParams, options = {}) {
  const query = searchParams.toString();
  return apiRequest(`/api/homes${query ? `?${query}` : ''}`, options);
}

// Fetches the details for one home.
export function getHome(homeId, options = {}) {
  return apiRequest(`/api/homes/${encodeURIComponent(homeId)}`, options);
}
