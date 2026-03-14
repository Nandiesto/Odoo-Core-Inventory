import axios from 'axios';

const baseURL = 'http://localhost:8000/api/';

export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor to attach access token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh on 401s
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refresh = localStorage.getItem('refresh_token');
                if (!refresh) throw new Error('No refresh token available');

                // Do not use apiClient here to avoid infinite loops, use raw axios
                const { data } = await axios.post(`${baseURL}auth/token/refresh/`, { refresh });
                localStorage.setItem('access_token', data.access);

                originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
                return apiClient(originalRequest);
            } catch (err) {
                // Refresh failed, force logout
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export const api = {
    // Auth
    login: (credentials) => apiClient.post('auth/token/', credentials),
    register: (data) => apiClient.post('auth/register/', data),
    requestOtp: (email) => apiClient.post('auth/otp/request/', { email }),
    verifyOtp: (email, otp) => apiClient.post('auth/otp/verify/', { email, otp }),
    resetPassword: (data) => apiClient.post('auth/password/reset/', data),

    // Dashboard (We still mock this until we build the real backend dashboard endpoint, but structure is here)
    getDashboard: () => apiClient.get('dashboard/'),

    // Inventory Models
    getProducts: (params) => apiClient.get('products/', { params }),
    getProduct: (id) => apiClient.get(`products/${id}/`),
    createProduct: (data) => apiClient.post('products/', data),

    getCategories: () => apiClient.get('categories/'),
    createCategory: (data) => apiClient.post('categories/', data),
    getWarehouses: () => apiClient.get('warehouses/'),
    createWarehouse: (data) => apiClient.post('warehouses/', data),
    getLocations: () => apiClient.get('locations/'),
    createLocation: (data) => apiClient.post('locations/', data),

    // Operations
    getReceipts: (params) => apiClient.get('receipts/', { params }),
    getReceipt: (id) => apiClient.get(`receipts/${id}/`),
    createReceipt: (data) => apiClient.post('receipts/', data),
    confirmReceipt: (id) => apiClient.post(`receipts/${id}/confirm_receipt/`),
    validateReceipt: (id) => apiClient.post(`receipts/${id}/validate_receipt/`),

    getDeliveries: (params) => apiClient.get('deliveries/', { params }),
    getDelivery: (id) => apiClient.get(`deliveries/${id}/`),
    createDelivery: (data) => apiClient.post('deliveries/', data),
    confirmDelivery: (id) => apiClient.post(`deliveries/${id}/confirm_delivery/`),
    validateDelivery: (id) => apiClient.post(`deliveries/${id}/validate_delivery/`),

    getTransfers: (params) => apiClient.get('transfers/', { params }),
    getTransfer: (id) => apiClient.get(`transfers/${id}/`),
    createTransfer: (data) => apiClient.post('transfers/', data),
    confirmTransfer: (id) => apiClient.post(`transfers/${id}/confirm_transfer/`),
    validateTransfer: (id) => apiClient.post(`transfers/${id}/validate_transfer/`),

    getMoves: (params) => apiClient.get('moves/', { params }),
};
