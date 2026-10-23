// React

// External libraries

// Local files
import { apiRequest, clearCsrfToken, getCsrfToken } from './apiClient';

// Reads the current user's session details.
export function getCurrentUser() {
  return apiRequest('/api/auth/me');
}

// Logs in and refreshes the cached token rotated by the server.
export async function loginUser(values) {
  clearCsrfToken();
  const response = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: values,
  });
  clearCsrfToken();
  await getCsrfToken();
  return response;
}

// Creates a guest account; the API requires a separate login afterward.
export function signupUser(values) {
  return apiRequest('/api/auth/signup', { method: 'POST', body: values });
}

// Ends the current session and clears its cached token.
export async function logoutUser() {
  const response = await apiRequest('/api/auth/logout', {
    method: 'POST',
    body: {},
  });
  clearCsrfToken();
  return response;
}
