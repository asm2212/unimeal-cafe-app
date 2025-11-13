import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://unimeal-backend.duckdns.org';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['cafeId', 'cafeName']);
    }
    return Promise.reject(error);
  }
);

export interface CafeLoginData {
  username: string;
  password: string;
}

export interface StudentRegistrationData {
  fullName: string;
  studentId: string;
  username: string;
  phone: string;
  department?: string;
  password: string;
  balance: number;
  cafeId: string;
}

export interface Student {
  id: string;
  fullName: string;
  name?: string;
  studentId: string;
  username: string;
  phone: string;
  department?: string;
  balance: number;
  cafeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlan {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  cafeId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  studentId?: string;
  cafeId?: string;
  amount: number;
  mealType?: string; 
  type: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt?: string;
  timestamp: string;
  status: string;
  student?: {
    fullName: string;
    studentId: string;
    phone: string;
  };
  referenceId?: string;
  notes?: string;
}

export interface CafeDashboard {
  cafe: {
    id: string;
    name: string;
    ownerName: string;
    contact: string;
    location: string;
    isActive: boolean;
  };
  statistics: {
    students: {
      total: number;
      registeredThisWeek: number;
      lowBalance: number;
    };
    balance: {
      total: number;
      average: number;
    };
    revenue: {
      today: {
        amount: number;
        transactions: number;
      };
      weekly: {
        amount: number;
        transactions: number;
      };
      monthly: {
        amount: number;
        transactions: number;
      };
    };
  };
}

// Auth APIs
export const cafeLogin = async (data: CafeLoginData) => {
  try {
    const response = await api.post('/auth/cafe/login', { 
      identifier: data.username.trim(), 
      password: data.password 
    });
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const cafeLogout = async () => {
  try {
    await api.post('/auth/cafe/logout');
    // Clear stored cafe info
    await AsyncStorage.multiRemove(['cafeId', 'cafeName']);
  } catch (error) {
    // Even if logout fails on server, clear local data
    await AsyncStorage.multiRemove(['cafeId', 'cafeName']);
    throw error;
  }
};

// Dashboard API
export const getCafeDashboard = async () => {
  const response = await api.get('/cafe/dashboard');
  return response.data;
};

// Student APIs
export const getStudents = async () => {
  try {
    const response = await api.get('/cafe/students');
    return response.data;
  } catch (error: any) {
    console.error('Students API error:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const getStudent = async (id: string) => {
  try {
    const response = await api.get(`/cafe/students/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Student details error:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const registerStudent = async (data: StudentRegistrationData) => {
  try {
    const response = await api.post('/cafe/students/register', data);
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const updateStudent = async (id: string, data: any) => {
  const response = await api.put(`/cafe/students/${id}`, data);
  return response.data;
};

export const deleteStudent = async (id: string) => {
  const response = await api.delete(`/cafe/students/${id}`);
  return response.data;
};

export const updateStudentBalance = async (id: string, data: { amount: number; operation: 'add' | 'subtract'; reason: string; paymentMethod?: string }) => {
  try {
    const response = await api.post(`/cafe/students/${id}/balance`, data);
    return response.data;
  } catch (error: any) {
    console.error('Balance update error:', error.response?.data?.message || error.message);
    throw error;
  }
};

// Cafe Profile APIs
export const getCafeProfile = async () => {
  try {
    const response = await api.get('/cafe/profile');
    return response.data;
  } catch (error: any) {
    console.error('Profile error:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const updateCafeProfile = async (data: {
  name: string;
  ownerName: string;
  contact: string;
  location?: string;
}) => {
  try {
    const response = await api.put('/cafe/profile', data);
    return response.data;
  } catch (error: any) {
    console.error('Profile update error:', error.response?.data?.message || error.message);
    throw error;
  }
};

// Transaction APIs
export interface TransactionFilters {
  studentId?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  period?: 'day' | 'week' | 'month' | 'all';
}

export const getTransactions = async (filters?: TransactionFilters) => {
  try {
    const response = await api.get('/cafe/transactions', { params: filters });
    return response.data;
  } catch (error: any) {
    console.error('Transactions error:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const getStudentTransactions = async (studentId: string, filters?: Omit<TransactionFilters, 'studentId'>) => {
  try {
    const response = await api.get(`/cafe/students/${studentId}/transactions`, { params: filters });
    return response.data;
  } catch (error: any) {
    console.error('Student transactions error:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const createTransaction = async (data: any) => {
  const response = await api.post('/cafe/transactions', data);
  return response.data;
};

// Meal Plan APIs
export const getMealPlans = async () => {
  const response = await api.get('/cafe/meal-plans');
  return response.data;
};

export const createMealPlan = async (data: any) => {
  const response = await api.post('/cafe/meal-plans', data);
  return response.data;
};

export const updateMealPlan = async (id: string, data: any) => {
  const response = await api.put(`/cafe/meal-plans/${id}`, data);
  return response.data;
};

export const deleteMealPlan = async (id: string) => {
  const response = await api.delete(`/cafe/meal-plans/${id}`);
  return response.data;
};

// QR Code APIs
export const getCafeQR = async (cafeId: string) => {
  try {
    const response = await api.get(`/qr/cafe/${cafeId}`);
    return response.data;
  } catch (error: any) {
    console.error('QR code error:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const generateCafeQR = async (cafeId: string) => {
  try {
    const response = await api.get(`/qr/cafe/${cafeId}/generate`);
    return response.data;
  } catch (error: any) {
    console.error('Generate QR error:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const validateQRCode = async (qrData: string) => {
  const response = await api.post('/qr/validate-setup', { qrData });
  return response.data;
};

// Cafe Settings
export const getCafeSettings = async () => {
  const response = await api.get('/cafe/settings');
  return response.data;
};

export const updateCafeSettings = async (data: any) => {
  const response = await api.put('/cafe/settings', data);
  return response.data;
};

export default api;
