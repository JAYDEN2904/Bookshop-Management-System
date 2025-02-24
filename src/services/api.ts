import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth API
export const auth = {
  login: async (name: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { name, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  signup: async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }
};

// Books API
export const books = {
  getAll: async () => {
    try {
      const response = await api.get('/books');
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  create: async (bookData: {
    title: string;
    subject: string;
    class_level: string;
    price: number;
    stock: number;
  }) => {
    try {
      const response = await api.post('/books', bookData);
      return response.data;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  updateStock: async (id: string, stock: number) => {
    try {
      const response = await api.patch(`/books/${id}/stock`, { stock });
      return response.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },

  updatePrice: async (id: string, price: number) => {
    try {
      const response = await api.patch(`/books/${id}/price`, { price });
      return response.data;
    } catch (error) {
      console.error('Error updating price:', error);
      throw error;
    }
  },

  deleteBook: async (id: string) => {
    try {
      const response = await api.delete(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  }
};

// Sales API
export const sales = {
  create: async (saleData: any) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  getReport: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/sales/report?${params}`);
    return response.data;
  }
};

// Students API
export const students = {
  getAll: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  create: async (studentData: any) => {
    const response = await api.post('/students', studentData);
    return response.data;
  }
};

// Suppliers API
export const suppliers = {
  getAll: async () => {
    const response = await api.get('/suppliers');
    return response.data;
  },

  create: async (supplierData: any) => {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  },

  makePayment: async (id: string, amount: number) => {
    const response = await api.post(`/suppliers/${id}/payments`, { amount });
    return response.data;
  }
};

// Settings API
export const settings = {
  get: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  update: async (settingsData: any) => {
    const response = await api.put('/settings', settingsData);
    return response.data;
  }
}; 