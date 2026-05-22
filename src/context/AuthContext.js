import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, clearAuthToken, getAuthToken, setAuthToken, userApi } from "../services/api";

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;
  const [firstName = "", ...rest] = (user.name || "").split(" ");
  return {
    ...user,
    firstName,
    lastName: rest.join(" "),
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getAuthToken());
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(getAuthToken()));
  const [authError, setAuthError] = useState("");

  const setCurrentUser = useCallback((nextUser) => {
    setUser(normalizeUser(nextUser));
  }, []);

  const applySession = useCallback((nextToken, nextUser) => {
    if (nextToken) {
      setAuthToken(nextToken);
      setToken(nextToken);
    }
    if (nextUser) {
      setCurrentUser(nextUser);
    }
    setAuthError("");
  }, [setCurrentUser]);

  const clearSession = useCallback(() => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getAuthToken()) {
      setAuthLoading(false);
      return null;
    }

    setAuthLoading(true);
    try {
      const response = await authApi.me();
      const currentUser = normalizeUser(response.data?.user);
      setCurrentUser(currentUser);
      setAuthError("");
      return currentUser;
    } catch (error) {
      clearSession();
      setAuthError(error.message);
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, [clearSession, setCurrentUser]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleExpired = () => {
      clearSession();
      setAuthError("Your session expired. Please sign in again.");
    };

    window.addEventListener("oe:auth-expired", handleExpired);
    return () => window.removeEventListener("oe:auth-expired", handleExpired);
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    setAuthLoading(true);
    try {
      const response = await authApi.login(credentials);
      applySession(response.token, response.data?.user);
      return response;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, [applySession]);

  const signup = useCallback(async (payload) => {
    setAuthLoading(true);
    try {
      const response = await authApi.register(payload);
      applySession(response.token, response.data?.user);
      return response;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, [applySession]);

  const logout = useCallback(async () => {
    try {
      if (getAuthToken()) await authApi.logout();
    } catch (_error) {
      // Stateless JWT — client clears local session regardless.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const changePassword = useCallback(async (payload) => {
    const response = await authApi.changePassword(payload);
    applySession(response.token, response.data?.user);
    return response;
  }, [applySession]);

  const updateProfile = useCallback(async (payload) => {
    const response = await userApi.updateProfile(payload);
    setCurrentUser(response.data?.user);
    return response;
  }, [setCurrentUser]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      authLoading,
      authError,
      login,
      signup,
      logout,
      changePassword,
      refreshUser,
      updateProfile,
      applySession,
      clearSession,
      setUser: setCurrentUser,
    }),
    [
      token,
      user,
      authLoading,
      authError,
      login,
      signup,
      logout,
      changePassword,
      refreshUser,
      updateProfile,
      applySession,
      clearSession,
      setCurrentUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
