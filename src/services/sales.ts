import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const sales = {
  getReport: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await axios.get(`${API_URL}/sales/report?${params}`);
    return response.data;
  },

  create: async (saleData: any) => {
    const response = await axios.post(`${API_URL}/sales`, saleData);
    return response.data;
  }
}; 