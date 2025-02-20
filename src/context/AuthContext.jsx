import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialRedirectDone, setInitialRedirectDone] = useState(false); // Track first redirect
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? user.email : "No user");
      setCurrentUser(user);
      setLoading(false);

      // Handle post-login navigation only once
      if (user && !initialRedirectDone) {
        const redirectTo = location.state?.from?.pathname || "/";
        if (location.pathname !== redirectTo) {
          console.log("Redirecting to:", redirectTo);
          navigate(redirectTo, { replace: true });
        } else {
          console.log("Already on redirected path:", redirectTo);
        }
        setInitialRedirectDone(true); // Mark redirect as done
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]); // Use location.pathname instead of location.state

  const logout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out, redirecting to /login");
      setInitialRedirectDone(false); // Reset for next login
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    currentUser,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
