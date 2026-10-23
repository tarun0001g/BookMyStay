// React

// External libraries

// Local files
import { apiRequest } from './apiClient';

// Fetches a page of homes using the current search parameters.
export function getHomes(searchParams) {
  const query = searchParams.toString();
  return apiRequest(`/api/homes${query ? `?${query}` : ''}`);
}

// Fetches the details for one home.
export function getHome(homeId) {
  return apiRequest(`/api/homes/${encodeURIComponent(homeId)}`);
}
