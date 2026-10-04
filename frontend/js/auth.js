// Auth Module
class Auth {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.loadUser();
  }

  loadUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (userStr) {
      this.user = JSON.parse(userStr);
      this.isAuthenticated = true;
    }
  }

  setUser(user) {
    this.user = user;
    this.isAuthenticated = true;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  clearUser() {
    this.user = null;
    this.isAuthenticated = false;
    localStorage.removeItem(STORAGE_KEYS.USER);
    api.setToken(null);
  }

  async login(email, password) {
    try {
      if (CONFIG.DEMO_MODE) {
        // Demo login
        const user = DEMO_USERS.find(u => u.email === email);
        if (!user) {
          throw new Error('User not found');
        }
        
        const token = 'demo-token-' + Date.now();
        api.setToken(token);
        this.setUser(user);
        return { user, token };
      }
      
      const response = await api.login(email, password);
      api.setToken(response.token);
      this.setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(data) {
    try {
      const response = await api.register(data);
      api.setToken(response.token);
      this.setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    this.clearUser();
    window.location.hash = '#/login';
  }

  async checkAuth() {
    if (!this.isAuthenticated) {
      return false;
    }

    try {
      if (CONFIG.DEMO_MODE) {
        return this.user;
      }
      
      const user = await api.getMe();
      this.setUser(user);
      return user;
    } catch (error) {
      this.clearUser();
      return false;
    }
  }
}

const auth = new Auth();
