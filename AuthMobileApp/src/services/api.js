import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración base de la API
const BASE_URL = 'http://10.0.2.2:8000/api/v1'; // IP para emulador Android (mapea a localhost del host)

// Crear instancia de axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, remover del storage
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authAPI = {
  // Registro de usuario
  signup: async (name, email, password) => {
    try {
      const response = await apiClient.post('/signup', {
        username: name,  // El backend espera 'username', no 'name'
        email,
        password,
      });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error en el registro'
      };
    }
  },

  // Login de usuario usando fetch en vez de Axios
  login: async (email, password) => {
    try {
      const body = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const response = await fetch(`${BASE_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        await AsyncStorage.setItem('access_token', data.access_token);
        return { success: true, data };
      } else {
        return {
          success: false,
          error: data.detail || 'Error en el login'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error en el login'
      };
    }
  },

  // Obtener información del usuario actual
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/users/me');
      // Guardar datos del usuario
      await AsyncStorage.setItem('user_data', JSON.stringify(response));
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error obteniendo datos del usuario'
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user_data');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error cerrando sesión' };
    }
  },

  // Verificar si hay una sesión activa
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return { success: false };

      const userResponse = await authAPI.getCurrentUser();
      return userResponse;
    } catch (error) {
      return { success: false };
    }
  }
};

// Servicios para rutas protegidas
export const protectedAPI = {
  // Obtener datos del dashboard
  getDashboard: async () => {
    try {
      const response = await apiClient.get('/dashboard');
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error obteniendo dashboard'
      };
    }
  },

  // Ruta protegida de ejemplo
  getProtectedData: async () => {
    try {
      const response = await apiClient.get('/protected');
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error obteniendo datos protegidos'
      };
    }
  }
};

// Servicios para las citas
export const appointmentsAPI = {
  // Crear una nueva cita
  createAppointment: async (appointmentData) => {
    try {
      const response = await apiClient.post('/appointments/', appointmentData);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al crear la cita'
      };
    }
  },

  // Obtener las citas del usuario actual
  getMyAppointments: async () => {
    try {
      const response = await apiClient.get('/appointments/my-appointments');
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener las citas'
      };
    }
  },

  // Obtener disponibilidad de horarios para una fecha
  getAvailability: async (date) => {
    try {
      const response = await apiClient.get(`/appointments/availability/${date}`);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al obtener disponibilidad'
      };
    }
  },

  // Cancelar una cita
  cancelAppointment: async (appointmentId) => {
    try {
      await apiClient.delete(`/appointments/${appointmentId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Error al cancelar la cita'
      };
    }
  }
};

export default apiClient;