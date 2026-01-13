import axios from 'axios';

// Hardcoded production API URL to ensure it works in Capacitor app
const API_URL = 'https://backend-tau-blush-82.vercel.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error handling
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please check your internet connection and try again.';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network error. Please check your internet connection.';
    } else if (!error.response) {
      error.message = 'Unable to connect to server. Please check your internet connection.';
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    return api.post('/products', data, config);
  },
  update: (id, data) => {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    return api.put(`/products/${id}`, data, config);
  },
  delete: (id) => api.delete(`/products/${id}`),
  getOTTTypes: () => api.get('/products/ott-types'),
};

export const orderAPI = {
  create: (data) => {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    return api.post('/orders', data, config);
  },
  getMyOrders: () => api.get('/orders/my-orders'),
  getAll: (params) => api.get('/orders/all', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  deliver: (id, data) => api.put(`/orders/${id}/deliver`, data),
  updatePayment: (id, data) => api.put(`/orders/${id}/payment`, data),
};

export const subscriptionAPI = {
  getMySubscriptions: (params) => api.get('/subscriptions/my-subscriptions', { params }),
  getAll: (params) => api.get('/subscriptions/all', { params }),
  getById: (id) => api.get(`/subscriptions/${id}`),
  update: (id, data) => api.put(`/subscriptions/${id}`, data),
  cancel: (id) => api.put(`/subscriptions/${id}/cancel`),
  requestSignInCode: (id) => api.post(`/subscriptions/${id}/request-signin-code`),
  sendSignInCode: (data) => api.post('/subscriptions/send-signin-code', data),
  getSignInRequests: () => api.get('/subscriptions/sign-in-requests'),
};

export const transactionAPI = {
  create: (data) => api.post('/transactions', data),
  getMyTransactions: (params) => api.get('/transactions/my-transactions', { params }),
  getAll: (params) => api.get('/transactions/all', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  updateStatus: (id, data) => api.put(`/transactions/${id}/status`, data),
  refund: (id, data) => api.put(`/transactions/${id}/refund`, data),
};

export const ticketAPI = {
  create: (data) => api.post('/tickets', data),
  getMyTickets: () => api.get('/tickets/my-tickets'),
  getAll: (params) => api.get('/tickets/all', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  addMessage: (id, data) => api.post(`/tickets/${id}/messages`, data),
  updateStatus: (id, data) => api.put(`/tickets/${id}/status`, data),
  getUnreadCount: () => api.get('/tickets/unread-count'),
  markAsRead: (id) => api.put(`/tickets/${id}/mark-read`),
};

export const categoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  updateOrder: (categories) => api.put('/categories/order/update', { categories }),
};

export const faqAPI = {
  getAll: (params) => api.get('/faqs', { params }),
  create: (data) => api.post('/faqs', data),
  update: (id, data) => api.put(`/faqs/${id}`, data),
  delete: (id) => api.delete(`/faqs/${id}`)
};

export const tutorialAPI = {
  getAllTutorials: () => api.get('/tutorials'),
  getTutorialById: (id) => api.get(`/tutorials/${id}`),
  createTutorial: (data) => api.post('/tutorials', data),
  updateTutorial: (id, data) => api.put(`/tutorials/${id}`, data),
  deleteTutorial: (id) => api.delete(`/tutorials/${id}`)
};

export const couponAPI = {
  getAllCoupons: () => api.get('/coupons'),
  getCouponById: (id) => api.get(`/coupons/${id}`),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
  validateCoupon: (data) => api.post('/coupons/validate', data),
  applyCoupon: (data) => api.post('/coupons/apply', data),
  getCouponStats: () => api.get('/coupons/stats')
};

export const analyticsAPI = {
  getAnalytics: (period = '30') => api.get(`/analytics?period=${period}`),
  getRevenue: (startDate, endDate) => api.get(`/analytics/revenue?startDate=${startDate}&endDate=${endDate}`),
  getCouponAnalytics: (period = '30') => api.get(`/analytics/coupons?period=${period}`)
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getCustomerDetails: (id) => api.get(`/admin/customers/${id}`),
  toggleCustomerStatus: (id) => api.put(`/admin/customers/${id}/toggle-status`),
};

export const paymentAPI = {
  getStripeConfig: () => api.get('/payment/stripe/config'),
  getPayPalConfig: () => api.get('/payment/paypal/config'),
  createStripeIntent: (data) => api.post('/payment/stripe/create-intent', data),
  confirmStripePayment: (data) => api.post('/payment/stripe/confirm', data),
  createPayPalOrder: (data) => api.post('/payment/paypal/create-order', data),
  capturePayPalOrder: (data) => api.post('/payment/paypal/capture-order', data),
};


export default api;
