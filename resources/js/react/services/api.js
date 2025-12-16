import axios from 'axios';

// Configurar la URL base de la API
// Usar URL relativa si está en el mismo dominio, o absoluta si es necesario
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // No necesario para tokens Bearer, solo para cookies
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Si es FormData, eliminar Content-Type para que el navegador lo establezca con boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el token expiró o es inválido, limpiar y redirigir al login
    // Pero solo si no estamos ya en la página de login
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/registro') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Log de errores para debugging
    if (error.response) {
      console.error('Error de API:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      console.error('Error de red:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  // Registro
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Verificar token
  verifyToken: async () => {
    const response = await api.get('/verify-token');
    return response.data;
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    const response = await api.get('/user');
    return response.data;
  },
};

// Servicios de lugares
export const placesService = {
  getAll: async (params = {}) => {
    const response = await api.get('/places', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/places/${id}`);
    return response.data;
  },

  create: async (placeData) => {
    const response = await api.post('/places', placeData);
    return response.data;
  },

  update: async (id, placeData) => {
    const response = await api.put(`/places/${id}`, placeData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/places/${id}`);
    return response.data;
  },
};

// Servicios de reservas
export const reservationsService = {
  getMyReservations: async () => {
    const response = await api.get('/reservations/my');
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/reservations');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  create: async (reservationData) => {
    const response = await api.post('/reservations', reservationData);
    return response.data;
  },

  update: async (id, reservationData) => {
    const response = await api.put(`/reservations/${id}`, reservationData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/reservations/${id}`);
    return response.data;
  },
};

// Servicios de reseñas
export const reviewsService = {
  getAll: async () => {
    const response = await api.get('/reviews/all');
    return response.data;
  },

  getByPlace: async (placeId) => {
    const response = await api.get(`/places/${placeId}/reviews`);
    return response.data;
  },

  create: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};

// Servicios de favoritos
export const favoritesService = {
  getAll: async () => {
    const response = await api.get('/favorites');
    return response.data.favorites || response.data || [];
  },

  check: async (placeId) => {
    const response = await api.get(`/favorites/check/${placeId}`);
    return response.data.is_favorite || false;
  },

  add: async (placeId) => {
    const response = await api.post('/favorites', { place_id: placeId });
    return response.data;
  },

  remove: async (placeId) => {
    const response = await api.delete(`/favorites/${placeId}`);
    return response.data;
  },
};

// Servicios de categorías
export const categoriesService = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
};

// Servicios de perfil
export const profileService = {
  get: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  update: async (profileData) => {
    // Si hay una imagen, usar FormData
    if (profileData.foto_perfil instanceof File) {
      const formData = new FormData();
      formData.append('name', profileData.name);
      if (profileData.email) formData.append('email', profileData.email);
      if (profileData.telefono) formData.append('telefono', profileData.telefono);
      formData.append('foto_perfil', profileData.foto_perfil);
      
      // Para FormData, NO establecer Content-Type manualmente
      // El navegador lo establecerá automáticamente con el boundary correcto
      // El interceptor ya maneja esto, así que no necesitamos especificar headers aquí
      const response = await api.post('/profile', formData);
      return response.data;
    } else {
      // Si no hay imagen, enviar JSON normal
      const response = await api.put('/profile', profileData);
      return response.data;
    }
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/profile/password', passwordData);
    return response.data;
  },
};

// Servicios de mensajes
export const messagesService = {
  send: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },
};

// Servicios de contactos
export const contactsService = {
  send: async (contactData) => {
    const response = await api.post('/contacts', contactData);
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/contacts');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },
};

// Servicios de admin
export const adminService = {
  // Lugares
  places: {
    getAll: async () => {
      const response = await api.get('/admin/places');
      return response.data;
    },
    getById: async (id) => {
      const response = await api.get(`/admin/places/${id}`);
      return response.data;
    },
    create: async (placeData) => {
      const formData = new FormData();
      formData.append('name', placeData.name);
      if (placeData.location) formData.append('location', placeData.location);
      if (placeData.description) formData.append('description', placeData.description);
      if (placeData.latitude) formData.append('latitude', placeData.latitude);
      if (placeData.longitude) formData.append('longitude', placeData.longitude);
      if (placeData.image) formData.append('image', placeData.image);
      
      // Agregar categorías como array
      if (placeData.categories && Array.isArray(placeData.categories) && placeData.categories.length > 0) {
        placeData.categories.forEach((categoryId) => {
          formData.append('categories[]', categoryId);
        });
      }
      
      const response = await api.post('/admin/places', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    update: async (id, placeData) => {
      const formData = new FormData();
      formData.append('_method', 'PUT'); // Laravel necesita esto para PUT con FormData
      if (placeData.name) formData.append('name', placeData.name);
      if (placeData.location) formData.append('location', placeData.location);
      if (placeData.description) formData.append('description', placeData.description);
      if (placeData.latitude !== undefined && placeData.latitude !== '') formData.append('latitude', placeData.latitude);
      if (placeData.longitude !== undefined && placeData.longitude !== '') formData.append('longitude', placeData.longitude);
      if (placeData.image) formData.append('image', placeData.image);
      
      // Agregar categorías como array (incluso si está vacío para sincronizar)
      if (placeData.categories !== undefined) {
        if (Array.isArray(placeData.categories) && placeData.categories.length > 0) {
          placeData.categories.forEach((categoryId) => {
            formData.append('categories[]', categoryId);
          });
        } else {
          // Si está vacío, enviar array vacío para desasociar todas las categorías
          formData.append('categories[]', '');
        }
      }
      
      // Usar POST con _method=PUT para FormData (más compatible)
      const response = await api.post(`/admin/places/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    delete: async (id) => {
      const response = await api.delete(`/admin/places/${id}`);
      return response.data;
    },
  },
  
  // Usuarios
  users: {
    getAll: async () => {
      const response = await api.get('/admin/users');
      return response.data;
    },
    getById: async (id) => {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    },
    create: async (userData) => {
      const response = await api.post('/admin/users', userData);
      return response.data;
    },
    update: async (id, userData) => {
      const response = await api.put(`/admin/users/${id}`, userData);
      return response.data;
    },
    delete: async (id) => {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    },
  },
};

export default api;

