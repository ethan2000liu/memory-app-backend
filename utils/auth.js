// Token management utility
const AuthUtils = {
  setToken: (token, expiresIn) => {
    localStorage.setItem('token', token);
    // Store expiration timestamp
    const expiresAt = new Date().getTime() + expiresIn;
    localStorage.setItem('tokenExpiresAt', expiresAt);
  },

  getToken: () => {
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    
    if (!token || !expiresAt) {
      return null;
    }

    // Check if token has expired
    if (new Date().getTime() > parseInt(expiresAt)) {
      // Token expired, clean up
      AuthUtils.clearToken();
      return null;
    }

    return token;
  },

  clearToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiresAt');
  },

  isAuthenticated: () => {
    return !!AuthUtils.getToken();
  }
};

// Axios interceptor with expiration check
axios.interceptors.request.use(
  (config) => {
    const token = AuthUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token === null && !config.url.includes('/auth')) {
      // Token expired or missing, redirect to login
      // except for auth routes
      window.location.href = '/login';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
); 