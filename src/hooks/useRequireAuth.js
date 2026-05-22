import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * For actions on public pages (add to cart, wishlist) that need sign-in.
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = useCallback(() => {
    if (isAuthenticated) return true;

    const redirectPath = `${location.pathname}${location.search}`;
    navigate("/login", { state: { from: redirectPath } });
    return false;
  }, [isAuthenticated, location.pathname, location.search, navigate]);

  return { requireAuth, isAuthenticated };
}
