import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectPath = `${location.pathname}${location.search}`;
    return <Navigate to="/login" state={{ from: redirectPath }} replace />;
  }

  return children;
}
