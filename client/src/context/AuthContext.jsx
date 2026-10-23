// React
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// External libraries

// Local files
import { getCurrentUser, loginUser, logoutUser, signupUser } from '../api/authApi';

const AuthContext = createContext(null);

// Loads and updates the signed-in user for all routes.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((result) => setUser(result.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(values) {
    const result = await loginUser(values);
    setUser(result.user);
    return result.user;
  }

  async function signup(values) {
    return signupUser(values);
  }

  async function logout() {
    await logoutUser();
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Reads the session and account actions in route components.
export function useAuth() {
  return useContext(AuthContext);
}
