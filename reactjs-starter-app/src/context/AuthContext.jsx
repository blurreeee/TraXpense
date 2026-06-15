// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: (username, password) => {},
  logout: () => {},
});

const AUTH_KEY = 'traxpenses_auth';

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored ? JSON.parse(stored) : { isAuthenticated: false, user: null };
    } catch {
      return { isAuthenticated: false, user: null };
    }
  });

  // Persist auth state
  useEffect(() => {
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
    } catch {}
  }, [authState]);

  async function login(username, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        const user = await response.json();
        setAuthState({ isAuthenticated: true, user });
        navigate('/dashboard', { replace: true });
        return { success: true };
      } else {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Network error occurred' };
    }
  }

  async function register(userData) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (response.ok) {
        const user = await response.json();
        setAuthState({ isAuthenticated: true, user });
        navigate('/dashboard', { replace: true });
        return { success: true };
      } else {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, error: 'Network error occurred' };
    }
  }

  function logout() {
    setAuthState({ isAuthenticated: false, user: null });
    navigate('/login', { replace: true });
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
