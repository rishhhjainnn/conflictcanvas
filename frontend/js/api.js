// API Module - Centralized API calls
class API {
  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
    this.token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(data) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Projects
  async getProjects() {
    if (CONFIG.DEMO_MODE) {
      return [DEMO_PROJECT];
    }
    return this.request('/projects');
  }

  async createProject(data) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getProject(id) {
    if (CONFIG.DEMO_MODE) {
      return DEMO_PROJECT;
    }
    return this.request(`/projects/${id}`);
  }

  async updateProject(id, data) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE'
    });
  }

  // Tasks
  async getTasks(projectId) {
    if (CONFIG.DEMO_MODE) {
      return DEMO_TASKS.filter(t => t.project_id === projectId);
    }
    return this.request(`/projects/${projectId}/tasks`);
  }

  async getTask(id) {
    if (CONFIG.DEMO_MODE) {
      return DEMO_TASKS.find(t => t.id === id);
    }
    return this.request(`/tasks/${id}`);
  }

  async createTask(data) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateTask(id, data) {
    if (CONFIG.DEMO_MODE) {
      // Simulate version-based conflict detection
      const task = DEMO_TASKS.find(t => t.id === id);
      if (task) {
        const { baseVersion, ...updateData } = data;
        
        if (baseVersion !== undefined && baseVersion !== task.version) {
          // Conflict detected
          throw new Error('CONFLICT_DETECTED');
        }
        
        // Update task
        Object.assign(task, updateData);
        task.version += 1;
        task.updated_at = new Date().toISOString();
        return task;
      }
    }
    
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  }

  // Comments
  async getComments(taskId) {
    return this.request(`/tasks/${taskId}/comments`);
  }

  async addComment(taskId, data) {
    return this.request(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Conflicts
  async getConflicts() {
    return this.request('/conflicts');
  }

  async getConflict(id) {
    return this.request(`/conflicts/${id}`);
  }

  async resolveConflict(id, data) {
    return this.request(`/conflicts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Activity
  async getActivity(projectId) {
    return this.request(`/projects/${projectId}/activity`);
  }
}

// Create singleton instance
const api = new API();
