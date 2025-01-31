import axios from "axios";

const API_URL = "https://localhost:5000/api";

// Creating an instance of axios
const Api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
});

// Add token to requests if it exists
Api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
Api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("API Error:", {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
    });

    // Handle 401 errors
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes("login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const registerApi = (data) => Api.post("/auth/register", data);
export const loginApi = (data) => Api.post("/auth/login", data);
export const getCurrentUserApi = () => Api.get("/auth/me");
export const updateProfileApi = (data) => Api.put("/auth/profile", data);
export const changePasswordApi = (data) => Api.put("/auth/change-password", data);
export const forgotPasswordApi = (data) => Api.post("/auth/forgot-password", data);
export const resetPasswordApi = (data) => Api.post("/auth/reset-password", data);

// Logout function
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Product APIs
export const createProductApi = (formData) =>
  Api.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getAllProductsApi = (params) => Api.get("/products", { params });

export const getProductByIdApi = (id) => Api.get(`/products/${id}`);

export const updateProductApi = (id, formData) =>
  Api.put(`/products/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteProductApi = (id) => Api.delete(`/products/${id}`);

export const getProductCategoriesApi = () => Api.get("/products/categories");

// Cart APIs
export const getCartApi = () => Api.get("/cart");

export const addToCartApi = (data) => Api.post("/cart", data);

export const updateCartItemApi = (itemId, data) =>
  Api.put(`/cart/${itemId}`, data);

export const removeFromCartApi = (itemId) => Api.delete(`/cart/${itemId}`);

export const clearCartApi = () => Api.delete("/cart");

// Order APIs
export const createOrderApi = async (orderData) => {
  return Api.post("/orders", orderData);
};

export const getAllOrdersApi = (params) => Api.get("/orders", { params });

export const getOrderByIdApi = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }
    const response = await Api.get(`/orders/${orderId}`);
    return response;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
};

export const getMyOrdersApi = async () => {
  return Api.get("/orders/myorders");
};

export const updateOrderStatusApi = async (orderId, status) => {
  return Api.put(`/orders/${orderId}/status`, { status });
};

export const updatePaymentStatusApi = async (orderId, data) => {
  return Api.put(`/orders/${orderId}/payment`, data);
};

export const cancelOrderApi = async (orderId) => {
  try {
    const response = await Api.put(`/orders/${orderId}/cancel`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Admin APIs
export const getAdminDashboardStatsApi = () => Api.get("/admin/dashboard");

export const getAdminOrdersApi = (params) =>
  Api.get("/admin/orders", { params });

export const getAdminUsersApi = () => Api.get("/admin/users");

export const updateUserStatusApi = (userId, status) =>
  Api.put(`/admin/users/${userId}/status`, { status });

export const updateUserRoleApi = (userId, role) =>
  Api.put(`/admin/users/${userId}/role`, { role });

export const deleteUserApi = (userId) => Api.delete(`/admin/users/${userId}`);

// Review APIs
export const createReviewApi = (productId, data) =>
  Api.post(`/products/${productId}/reviews`, data);

export const getProductReviewsApi = (productId) =>
  Api.get(`/products/${productId}/reviews`);

export const updateReviewApi = (productId, reviewId, data) =>
  Api.put(`/products/${productId}/reviews/${reviewId}`, data);

export const deleteReviewApi = (productId, reviewId) =>
  Api.delete(`/products/${productId}/reviews/${reviewId}`);

// Wishlist APIs
export const getWishlistApi = () => Api.get("/wishlist");

export const addToWishlistApi = (productId) =>
  Api.post(`/wishlist/${productId}`);

export const removeFromWishlistApi = (productId) =>
  Api.delete(`/wishlist/${productId}`);

// Search APIs
export const searchProductsApi = (query) =>
  Api.get(`/products/search?q=${query}`);

export const getFilteredProductsApi = (filters) =>
  Api.get("/products/filter", { params: filters });

// Payment APIs
export const createPaymentIntentApi = (data) =>
  Api.post("/payments/create-intent", data);

export const confirmPaymentApi = (paymentId, data) =>
  Api.post(`/payments/${paymentId}/confirm`, data);

// Address APIs
export const addAddressApi = async (addressData) => {
  return Api.post("/auth/address", addressData);
};

export const getAddressesApi = async () => {
  return Api.get("/auth/address");
};

export const updateAddressApi = async (addressId, addressData) => {
  return Api.put(`/auth/address/${addressId}`, addressData);
};

export const deleteAddressApi = async (addressId) => {
  return Api.delete(`/auth/address/${addressId}`);
};

export const setDefaultAddressApi = async (addressId) => {
  return Api.put(`/auth/address/${addressId}/default`);
};

// User APIs
export const createUserApi = (userData) => Api.post("/admin/users", userData);

export default Api;
