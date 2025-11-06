import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://173.212.215.22:3003';

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
  console.log('=== CAFE LOGIN ATTEMPT ===');
  console.log('Username entered:', data.username);
  console.log('Password length:', data.password.length);
  console.log('API URL:', API_URL);
  console.log('Full request payload:', { 
    identifier: data.username.trim(), 
    password: data.password 
  });
  
  try {
    const response = await api.post('/auth/cafe/login', { 
      identifier: data.username.trim(), 
      password: data.password 
    });
    console.log('✅ Cafe login SUCCESS:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Cafe login FAILED');
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Full error:', error);
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
  console.log('Fetching students from /cafe/students');
  try {
    const response = await api.get('/cafe/students');
    console.log('Students API success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Students API error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const getStudent = async (id: string) => {
  console.log('Fetching student details for ID:', id);
  try {
    const response = await api.get(`/cafe/students/${id}`);
    console.log('Student details API success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Student details API error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const registerStudent = async (data: StudentRegistrationData) => {
  console.log('Registering student:', { ...data, password: '***' });
  
  try {
    const response = await api.post('/cafe/students/register', data);
    console.log('Student registration success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Student registration error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
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
  console.log('Updating student balance for ID:', id);
  console.log('Balance update data:', data);
  try {
    const response = await api.post(`/cafe/students/${id}/balance`, data);
    console.log('Balance update success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Balance update API error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Request URL:', `/cafe/students/${id}/balance`);
    throw error;
  }
};

// Cafe Profile APIs
export const getCafeProfile = async () => {
  console.log('Fetching cafe profile from /cafe/profile');
  try {
    const response = await api.get('/cafe/profile');
    console.log('Cafe profile API success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Cafe profile API error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const updateCafeProfile = async (data: {
  name: string;
  ownerName: string;
  contact: string;
  location?: string;
}) => {
  console.log('Updating cafe profile:', data);
  try {
    const response = await api.put('/cafe/profile', data);
    console.log('Update cafe profile success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Update cafe profile error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Transaction APIs
export const getTransactions = async (params?: any) => {
  console.log('Fetching transactions from /cafe/transactions');
  try {
    const response = await api.get('/cafe/transactions', { params });
    console.log('Transactions API success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Transactions API error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
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
  console.log('Fetching cafe QR from /qr/cafe/', cafeId);
  try {
    const response = await api.get(`/qr/cafe/${cafeId}`);
    console.log('Cafe QR API success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Cafe QR API error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const generateCafeQR = async (cafeId: string) => {
  console.log('Generating cafe QR from /qr/cafe/', cafeId, '/generate');
  try {
    const response = await api.get(`/qr/cafe/${cafeId}/generate`);
    console.log('Generate cafe QR API success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Generate cafe QR API error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
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
