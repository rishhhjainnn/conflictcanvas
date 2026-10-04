// Main Application
class App {
  constructor() {
    this.currentPage = null;
    this.routes = {
      '/': 'dashboard',
      '/dashboard': 'dashboard',
      '/projects': 'projects',
      '/project': 'project',
      '/task': 'task',
      '/conflicts': 'conflicts',
      '/activity': 'activity',
      '/ai-analyzer': 'ai-analyzer',
      '/team': 'team',
      '/profile': 'profile',
      '/settings': 'settings',
      '/login': 'login'
    };
    
    this.init();
  }

  async init() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Load persistent data
    await this.loadPersistentData();
    
    // Handle routing
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }

  async loadPersistentData() {
    try {
      // Load projects, tasks, conflicts from localStorage
      await Promise.all([
        projects.getProjects(),
        tasks.getTasks(1),
        conflicts.getConflicts()
      ]);
    } catch (error) {
      console.error('Error loading persistent data:', error);
    }
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const route = this.routes[hash] || 'dashboard';
    
    this.currentPage = route;
    this.renderPage(route);
  }

  async renderPage(route) {
    const app = document.getElementById('app');
    
    try {
      let content;
      
      switch (route) {
        case 'dashboard':
          content = await this.loadTemplate('dashboard.html');
          break;
        case 'projects':
          content = await this.loadTemplate('projects.html');
          break;
        case 'project':
          content = await this.loadTemplate('project.html');
          break;
        case 'task':
          content = await this.loadTemplate('task.html');
          break;
        case 'conflicts':
          content = await this.loadTemplate('conflicts.html');
          break;
        case 'activity':
          content = await this.loadTemplate('activity.html');
          break;
        case 'ai-analyzer':
          content = await this.loadTemplate('ai-analyzer.html');
          break;
        default:
          content = await this.loadTemplate('dashboard.html');
      }
      
      app.innerHTML = content;
      this.initAiAnalyzerNavigation(route);
      this.initMobileNavigation();
      lucide.createIcons();
      
      // Initialize page-specific logic
      if (route === 'dashboard') {
        await this.initDashboard();
      } else if (route === 'projects') {
        projects.renderProjects();
      } else if (route === 'ai-analyzer') {
        await aiAnalyzer.initialize();
      }
      
    } catch (error) {
      console.error('Error loading page:', error);
      app.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p class="loading-text">Error loading page</p></div>';
    }
  }

  initAiAnalyzerNavigation(route) {
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (!sidebarNav) return;

    let link = sidebarNav.querySelector('[data-ai-analyzer-link]');
    if (!link) {
      link = document.createElement('a');
      link.href = '#/ai-analyzer';
      link.className = 'sidebar-nav-item';
      link.dataset.aiAnalyzerLink = 'true';
      link.innerHTML = '<i data-lucide="sparkles"></i> AI Analyzer';
      sidebarNav.append(link);
    }

    if (route === 'ai-analyzer') {
      sidebarNav.querySelectorAll('.sidebar-nav-item').forEach(item => item.classList.remove('active'));
      link.classList.add('active');
    }
  }

  initMobileNavigation() {
    const navbarActions = document.querySelector('.navbar-right');
    const mainLayout = document.querySelector('.main-layout');
    const sidebar = document.querySelector('.sidebar');
    if (!navbarActions || !mainLayout || !sidebar) return;

    const menuButton = document.createElement('button');
    menuButton.type = 'button';
    menuButton.className = 'navbar-icon-btn navbar-menu-toggle';
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.innerHTML = '<i data-lucide="menu"></i>';
    navbarActions.prepend(menuButton);

    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    mainLayout.insertBefore(overlay, sidebar);

    const closeMenu = () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation menu');
      menuButton.innerHTML = '<i data-lucide="menu"></i>';
      lucide.createIcons();
    };

    menuButton.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      overlay.classList.toggle('active', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      menuButton.innerHTML = `<i data-lucide="${isOpen ? 'x' : 'menu'}"></i>`;
      lucide.createIcons();
    });

    overlay.addEventListener('click', closeMenu);
    sidebar.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
  }

  async initDashboard() {
    // Load dashboard stats from persistent data
    await dashboard.loadStats();
    
    // Update stat counters with real data
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length > 0) {
      const stats = dashboard.stats;
      const counterMap = {
        'totalProjects': stats.totalProjects,
        'completedTasks': stats.completedTasks,
        'activeTasks': stats.activeTasks,
        'openConflicts': stats.openConflicts
      };
      
      counters.forEach(counter => {
        const countType = counter.getAttribute('data-count');
        if (counterMap[countType] !== undefined) {
          counter.setAttribute('data-count', counterMap[countType]);
        }
      });
    }
    
    this.initCharts();
    this.animateCounters();
  }

  async loadTemplate(filename) {
    const response = await fetch(`/pages/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    return await response.text();
  }

  initCharts() {
    // Task Distribution Chart
    const taskCtx = document.getElementById('task-chart');
    if (taskCtx) {
      const allTasks = tasks.tasks;
      const taskStatuses = [
        { key: 'todo', label: 'To Do' },
        { key: 'in_progress', label: 'In Progress' },
        { key: 'in_review', label: 'In Review' },
        { key: 'done', label: 'Done' },
        { key: 'blocked', label: 'Blocked' }
      ];
      const taskCounts = taskStatuses.map(status => allTasks.filter(task => task.status === status.key).length);
      const taskDetail = document.getElementById('task-chart-detail');
      const updateTaskDetail = (index) => {
        const status = taskStatuses[index];
        const matchingTasks = allTasks.filter(task => task.status === status.key);
        const taskNames = matchingTasks.slice(0, 3).map(task => task.title);
        const remaining = matchingTasks.length - taskNames.length;
        taskDetail.textContent = matchingTasks.length
          ? `${status.label} · ${matchingTasks.length} task${matchingTasks.length === 1 ? '' : 's'}${taskNames.length ? `: ${taskNames.join(', ')}` : ''}${remaining > 0 ? `, +${remaining} more` : ''}`
          : `${status.label} · No tasks`;
      };

      taskDetail.textContent = `${allTasks.length} tasks across ${taskStatuses.length} statuses`;
      
      new Chart(taskCtx, {
        type: 'doughnut',
        data: {
          labels: taskStatuses.map(status => status.label),
          datasets: [{
            data: taskCounts,
            backgroundColor: [
              'rgba(100, 116, 139, 0.8)',
              'rgba(99, 102, 241, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ],
            borderColor: [
              'rgba(100, 116, 139, 1)',
              'rgba(99, 102, 241, 1)',
              'rgba(245, 158, 11, 1)',
              'rgba(34, 197, 94, 1)',
              'rgba(239, 68, 68, 1)'
            ],
            borderWidth: 2,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick: (event, elements) => {
            if (elements.length) updateTaskDetail(elements[0].index);
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#94a3b8',
                font: {
                  family: 'Inter',
                  size: 11
                }
              }
            }
          }
        }
      });
    }

    // Project Progress Chart
    const progressCtx = document.getElementById('progress-chart');
    if (progressCtx) {
      const allProjects = projects.projects;
      const projectData = allProjects.map(p => ({
        name: p.name,
        progress: p.progress || 0,
        status: p.status || 'active',
        deadline: p.deadline
      }));
      const progressDetail = document.getElementById('progress-chart-detail');
      const updateProgressDetail = (index) => {
        const project = projectData[index];
        const deadline = project.deadline
          ? ` · Due ${new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
          : '';
        progressDetail.textContent = `${project.name} · ${project.progress}% complete · ${project.status.replaceAll('_', ' ')}${deadline}`;
      };

      progressDetail.textContent = projectData.length
        ? `${projectData.length} project${projectData.length === 1 ? '' : 's'} tracked`
        : 'No projects yet';
      progressCtx.parentElement.style.height = `${Math.max(250, projectData.length * 44)}px`;
      
      new Chart(progressCtx, {
        type: 'bar',
        data: {
          labels: projectData.map(p => p.name),
          datasets: [{
            label: 'Progress',
            data: projectData.map(p => p.progress),
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          onClick: (event, elements) => {
            if (elements.length) updateProgressDetail(elements[0].index);
          },
          scales: {
            x: {
              beginAtZero: true,
              max: 100,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#94a3b8',
                font: {
                  family: 'Inter'
                }
              }
            },
            y: {
              grid: {
                display: false
              },
              ticks: {
                color: '#f8fafc',
                font: {
                  family: 'Space Grotesk',
                  size: 12
                },
                callback: (value) => {
                  const label = projectData[value]?.name || '';
                  return label.length > 22 ? `${label.slice(0, 19)}...` : label;
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  }

  animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'));
      const duration = 1000;
      const start = 0;
      const startTime = performance.now();
      
      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * target);
        
        counter.textContent = current;
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };
      
      requestAnimationFrame(updateCounter);
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
