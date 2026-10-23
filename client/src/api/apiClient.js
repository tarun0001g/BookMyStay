// React

// External libraries

// Local files

let csrfTokenPromise;

// Sends same-origin API requests and provides readable server errors.
export async function apiRequest(path, options = {}) {
  const method = options.method || 'GET';
  const headers = new Headers(options.headers || {});
  const requestOptions = { ...options, method, headers, credentials: 'include' };

  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    headers.set('X-CSRF-Token', await getCsrfToken());
  }
  if (requestOptions.body && !(requestOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  const response = await fetch(path, requestOptions);
  const result = response.status === 204 ? {} : await response.json();
  if (!response.ok) {
    const error = new Error(result.message || 'Something went wrong.');
    error.status = response.status;
    error.errors = result.errors || {};
    throw error;
  }
  return result;
}

// Caches the session token until the server rotates it at login.
export async function getCsrfToken(refresh = false) {
  if (refresh) {
    csrfTokenPromise = undefined;
  }
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch('/api/csrf', { credentials: 'include' })
      .then((response) => response.json())
      .then((result) => result.csrfToken)
      .catch((error) => {
        csrfTokenPromise = undefined;
        throw error;
      });
  }
  return csrfTokenPromise;
}

// Drops the cached token after logout or a session change.
export function clearCsrfToken() {
  csrfTokenPromise = undefined;
}
