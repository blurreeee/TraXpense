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

  function login(username, password) {
    // Hard‑coded credentials
    if (username === 'Arjav' && password === 'Arjav123') {
      setAuthState({ isAuthenticated: true, user: { name: 'Arjav' } });
      navigate('/dashboard', { replace: true });
      return true;
    }
    return false;
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
