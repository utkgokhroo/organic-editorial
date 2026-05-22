import { normalizeCart, normalizeProduct } from "../utils/productUtils";
import {
  clearAuthToken,
  getAuthToken,
  hasAuthToken,
  setAuthToken,
} from "../utils/authStorage";
import {
  notifySessionExpired,
  resolveApiErrorCode,
  shouldExpireSession,
} from "../utils/authSession";

export { clearAuthToken, getAuthToken, setAuthToken, hasAuthToken };

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const API_TIMEOUT_MS = Number(process.env.REACT_APP_API_TIMEOUT_MS) || 12000;

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value) && value.length === 0) return;
    searchParams.set(key, Array.isArray(value) ? value.join(",") : value);
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export class ApiError extends Error {
  constructor(message, status, error, response) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.error = error;
    this.response = response;
  }
}

export async function apiRequest(path, options = {}) {
  const hadToken = hasAuthToken();
  const token = getAuthToken();
  const { body, headers: customHeaders, timeout = API_TIMEOUT_MS, skipSessionExpired, ...fetchOptions } = options;
  const headers = {
    Accept: "application/json",
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(customHeaders || {}),
  };
  const controller = new AbortController();
  const timeoutId = timeout
    ? window.setTimeout(() => controller.abort(), timeout)
    : null;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: fetchOptions.cache || "no-store",
      signal: controller.signal,
    });

    const text = await response.text();
    let data = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (_error) {
        data = { message: text };
      }
    }

    if (!response.ok) {
      const errorCode = resolveApiErrorCode(data.error);
      if (
        !skipSessionExpired &&
        shouldExpireSession({ path, status: response.status, hadToken, errorCode })
      ) {
        notifySessionExpired();
      }
      throw new ApiError(data.message || "API request failed", response.status, data.error, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error.name === "AbortError") {
      throw new ApiError(
        "Backend request timed out. Check that the backend is running and MongoDB is reachable.",
        0,
        "RequestTimeout"
      );
    }

    throw new ApiError(
      error.message || "Unable to connect to the backend.",
      0,
      "NetworkError"
    );
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

export const authApi = {
  login: (payload) =>
    apiRequest("/auth/login", { method: "POST", body: payload, skipSessionExpired: true }),
  register: (payload) =>
    apiRequest("/auth/register", { method: "POST", body: payload, skipSessionExpired: true }),
  me: () => apiRequest("/auth/me"),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
  changePassword: (payload) =>
    apiRequest("/auth/change-password", { method: "PUT", body: payload }),
};

export const productApi = {
  async list(params = {}) {
    const response = await apiRequest(`/products${buildQuery(params)}`);
    return {
      ...response,
      data: {
        ...response.data,
        products: (response.data?.products || []).map(normalizeProduct),
      },
    };
  },
  async get(id) {
    const response = await apiRequest(`/products/${id}`);
    return {
      ...response,
      data: {
        ...response.data,
        product: normalizeProduct(response.data?.product),
      },
    };
  },
};

export const cartApi = {
  async get() {
    const response = await apiRequest("/cart");
    return { ...response, data: { cart: normalizeCart(response.data?.cart) } };
  },
  async addItem(productId, quantity = 1) {
    const response = await apiRequest("/cart/items", {
      method: "POST",
      body: { productId, quantity },
    });
    return { ...response, data: { cart: normalizeCart(response.data?.cart) } };
  },
  async updateItem(productId, quantity) {
    const response = await apiRequest(`/cart/items/${productId}`, {
      method: "PUT",
      body: { quantity },
    });
    return { ...response, data: { cart: normalizeCart(response.data?.cart) } };
  },
  async removeItem(productId) {
    const response = await apiRequest(`/cart/items/${productId}`, { method: "DELETE" });
    return { ...response, data: { cart: normalizeCart(response.data?.cart) } };
  },
  async clear() {
    const response = await apiRequest("/cart", { method: "DELETE" });
    return { ...response, data: { cart: normalizeCart(response.data?.cart) } };
  },
  async previewCoupon(couponCode) {
    const response = await apiRequest("/cart/coupon", {
      method: "POST",
      body: { couponCode },
    });
    return { ...response, data: { cart: normalizeCart(response.data?.cart) } };
  },
  async checkoutPreview(couponCode = null) {
    const response = await apiRequest("/cart/checkout-preview", {
      method: "POST",
      body: couponCode ? { couponCode } : {},
    });
    return { ...response, data: { cart: normalizeCart(response.data?.cart) } };
  },
};

export const orderApi = {
  create: (payload) => apiRequest("/orders", { method: "POST", body: payload }),
  mine: (params = {}) => apiRequest(`/orders/my${buildQuery(params)}`),
  get: (id) => apiRequest(`/orders/${id}`),
};

export const userApi = {
  getProfile: () => apiRequest("/users/profile"),
  updateProfile: (payload) => apiRequest("/users/profile", { method: "PUT", body: payload }),
  /** @deprecated Use authApi.changePassword — kept for compatibility */
  updatePassword: (payload) => authApi.changePassword(payload),
  addAddress: (payload) => apiRequest("/users/addresses", { method: "POST", body: payload }),
  removeAddress: (addressId) => apiRequest(`/users/addresses/${addressId}`, { method: "DELETE" }),
  async getWishlist() {
    const response = await apiRequest("/users/wishlist");
    return {
      ...response,
      data: { wishlist: (response.data?.wishlist || []).map(normalizeProduct) },
    };
  },
  async addToWishlist(productId) {
    const response = await apiRequest(`/users/wishlist/${productId}`, { method: "POST" });
    return {
      ...response,
      data: { wishlist: (response.data?.wishlist || []).map(normalizeProduct) },
    };
  },
  async removeFromWishlist(productId) {
    const response = await apiRequest(`/users/wishlist/${productId}`, { method: "DELETE" });
    return {
      ...response,
      data: { wishlist: (response.data?.wishlist || []).map(normalizeProduct) },
    };
  },
};
