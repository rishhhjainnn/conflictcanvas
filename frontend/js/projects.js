// Projects Module
class ProjectsManager {
  constructor() {
    this.projects = [];
    this.currentProject = null;
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (stored) {
        this.projects = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading projects from storage:', error);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(this.projects));
    } catch (error) {
      console.error('Error saving projects to storage:', error);
    }
  }

  async getProjects() {
    try {
      if (CONFIG.DEMO_MODE) {
        // Use stored data or demo data
        if (this.projects.length === 0) {
          this.projects = [DEMO_PROJECT];
          this.saveToStorage();
        }
        return this.projects;
      }
      this.projects = await api.getProjects();
      this.saveToStorage();
      return this.projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Return stored data as fallback
      return this.projects;
    }
  }

  async getProject(projectId) {
    try {
      if (CONFIG.DEMO_MODE) {
        this.currentProject = this.projects.find(p => p.id === projectId) || DEMO_PROJECT;
        return this.currentProject;
      }
      this.currentProject = await api.getProject(projectId);
      return this.currentProject;
    } catch (error) {
      console.error('Error fetching project:', error);
      // Return from local storage as fallback
      this.currentProject = this.projects.find(p => p.id === projectId);
      return this.currentProject;
    }
  }

  async createProject(projectData) {
    try {
      if (CONFIG.DEMO_MODE) {
        const nextId = this.projects.reduce((highestId, project) => Math.max(highestId, Number(project.id) || 0), 0) + 1;
        const newProject = {
          ...projectData,
          id: nextId,
          created_at: new Date().toISOString()
        };
        this.projects.push(newProject);
        this.saveToStorage();
        notifications.show('success', 'Project created successfully');
        return newProject;
      }

      const newProject = await api.createProject(projectData);
      this.projects.push(newProject);
      this.saveToStorage();
      notifications.show('success', 'Project created successfully');
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      notifications.show('error', 'Failed to create project');
      throw error;
    }
  }

  async updateProject(projectId, projectData) {
    try {
      const updatedProject = await api.updateProject(projectId, projectData);
      
      // Update local projects array
      const index = this.projects.findIndex(p => p.id === projectId);
      if (index > -1) {
        this.projects[index] = updatedProject;
      }
      
      if (this.currentProject && this.currentProject.id === projectId) {
        this.currentProject = updatedProject;
      }
      
      this.saveToStorage();
      notifications.show('success', 'Project updated successfully');
      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      notifications.show('error', 'Failed to update project');
      throw error;
    }
  }

  async deleteProject(projectId) {
    try {
      await api.deleteProject(projectId);
      this.projects = this.projects.filter(p => p.id !== projectId);
      this.saveToStorage();
      notifications.show('success', 'Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      notifications.show('error', 'Failed to delete project');
      throw error;
    }
  }

  async refresh() {
    try {
      notifications.show('info', 'Refreshing projects...');
      await this.getProjects();
      notifications.show('success', 'Projects refreshed successfully');
      return this.projects;
    } catch (error) {
      console.error('Error refreshing projects:', error);
      notifications.show('error', 'Failed to refresh projects');
      throw error;
    }
  }

  getProjectsByStatus(status) {
    return this.projects.filter(p => p.status === status);
  }

  getProjectsByPriority(priority) {
    return this.projects.filter(p => p.priority === priority);
  }

  showCreateModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'create-project-modal';
    modal.innerHTML = `
      <div class="modal create-modal">
        <div class="modal-header">
          <div class="flex items-center gap-3">
            <div class="modal-icon">
              <i data-lucide="folder-plus"></i>
            </div>
            <div>
              <h2 class="font-heading text-xl">Create New Project</h2>
              <p class="text-sm text-muted">Set up a new project for your team</p>
            </div>
          </div>
          <button class="navbar-icon-btn" onclick="document.getElementById('create-project-modal').remove()">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="create-project-form" onsubmit="event.preventDefault(); projects.handleCreateSubmit();">
            <div class="form-group mb-4">
              <label class="form-label">Project Name *</label>
              <input type="text" id="project-name" class="input" placeholder="Enter project name" required>
            </div>
            
            <div class="form-group mb-4">
              <label class="form-label">Description</label>
              <textarea id="project-description" class="input" rows="3" placeholder="Describe your project..."></textarea>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="form-group">
                <label class="form-label">Status</label>
                <select id="project-status" class="input">
                  <option value="active">Active</option>
                  <option value="planned">Planned</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Priority</label>
                <select id="project-priority" class="input">
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            
            <div class="form-group mb-4">
              <label class="form-label">Deadline</label>
              <input type="date" id="project-deadline" class="input">
            </div>
            
            <div class="form-group">
              <label class="form-label">Team Members</label>
              <div class="team-selector">
                ${DEMO_USERS.map(member => `
                  <button type="button" class="team-member-option${member.id === 1 ? ' selected' : ''}" data-user-id="${member.id}" aria-pressed="${member.id === 1}" onclick="projects.toggleTeamMember(this)">
                    <span class="avatar avatar-sm">${member.avatar}</span>
                    <span class="text-sm">${member.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('create-project-modal').remove()">
            Cancel
          </button>
          <button class="btn btn-primary" type="submit" form="create-project-form">
            <i data-lucide="plus"></i>
            Create Project
          </button>
        </div>
      </div>
    `;
    
    document.getElementById('modal-container').appendChild(modal);
    lucide.createIcons();
  }

  toggleTeamMember(option) {
    const selected = option.getAttribute('aria-pressed') !== 'true';
    option.setAttribute('aria-pressed', String(selected));
    option.classList.toggle('selected', selected);
  }

  async handleCreateSubmit() {
    const name = document.getElementById('project-name').value.trim();
    const description = document.getElementById('project-description').value;
    const status = document.getElementById('project-status').value;
    const priority = document.getElementById('project-priority').value;
    const deadline = document.getElementById('project-deadline').value;
    
    if (!name) {
      notifications.show('error', 'Project name is required');
      return;
    }
    
    try {
      const newProject = {
        name,
        description,
        status,
        priority,
        deadline: deadline || null,
        progress: 0,
        created_by: 1,
        team: Array.from(document.querySelectorAll('.team-member-option[aria-pressed="true"]'))
          .map(option => DEMO_USERS.find(member => member.id === Number(option.dataset.userId)))
          .filter(Boolean)
      };
      
      await this.createProject(newProject);
      document.getElementById('create-project-modal').remove();
      
      if (window.app?.currentPage === 'dashboard') {
        await window.app.renderPage('dashboard');
      } else {
        this.renderProjects();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  }

  renderProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    if (this.projects.length === 0) {
      container.innerHTML = `
        <div class="projects-empty">
          <div class="projects-empty-icon">
            <i data-lucide="folder-open"></i>
          </div>
          <h3 class="projects-empty-title">No Projects Yet</h3>
          <p class="projects-empty-description">Create your first project to get started with ConflictCanvas</p>
          <button class="btn btn-primary" onclick="projects.showCreateModal()">
            <i data-lucide="plus"></i>
            Create Project
          </button>
        </div>
      `;
      return;
    }
    
    container.innerHTML = this.projects.map(project => `
      <div class="project-card" onclick="window.location.hash = '#/project?id=${project.id}'">
        <div class="project-card-header">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="project-card-title">${project.name}</h3>
              <span class="badge badge-${this.getStatusClass(project.status)}">${this.formatStatus(project.status)}</span>
            </div>
            <p class="project-card-description">${project.description || 'No description'}</p>
          </div>
        </div>
        
        <div class="project-card-meta">
          <div class="project-meta-item">
            <i data-lucide="check-square"></i>
            <span>${this.getTaskCount(project.id)} Tasks</span>
          </div>
          ${project.deadline ? `
          <div class="project-meta-item">
            <i data-lucide="calendar"></i>
            <span>${this.formatDate(project.deadline)}</span>
          </div>
          ` : ''}
          <div class="project-meta-item">
            <i data-lucide="flag"></i>
            <span class="priority-${project.priority}">${this.capitalize(project.priority)}</span>
          </div>
        </div>

        <div class="project-card-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${project.progress}%"></div>
          </div>
          <div class="progress-text">
            <span>Progress</span>
            <span>${project.progress}%</span>
          </div>
        </div>

        <div class="project-card-footer">
          <div class="project-team">
            ${this.renderTeamAvatars(project.team || DEMO_USERS.slice(0, 4))}
          </div>
          <div class="project-status">
            <span class="badge badge-${this.getPriorityClass(project.priority)}">${this.capitalize(project.priority)}</span>
          </div>
        </div>
      </div>
    `).join('');
    
    lucide.createIcons();
  }

  getTaskCount(projectId) {
    return tasks.tasks.filter(t => t.project_id === projectId).length;
  }

  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatStatus(status) {
    return status.split('_').map(word => this.capitalize(word)).join(' ');
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getStatusClass(status) {
    const classes = {
      active: 'success',
      completed: 'success',
      archived: 'muted',
      planned: 'primary',
      'on-hold': 'warning'
    };
    return classes[status] || 'primary';
  }

  getPriorityClass(priority) {
    const classes = {
      critical: 'danger',
      high: 'warning',
      medium: 'primary',
      low: 'success'
    };
    return classes[priority] || 'primary';
  }

  renderTeamAvatars(team) {
    const maxShow = 4;
    const visible = team.slice(0, maxShow);
    const remaining = team.length - maxShow;
    
    return visible.map(member => `
      <div class="avatar avatar-sm" title="${member.name}">${member.avatar || member.name.charAt(0)}</div>
    `).join('') + (remaining > 0 ? `<div class="avatar avatar-sm text-xs">+${remaining}</div>` : '');
  }
}

const projects = new ProjectsManager();
