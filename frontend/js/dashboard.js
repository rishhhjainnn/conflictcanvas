// Dashboard Module
class DashboardManager {
  constructor() {
    this.stats = {
      totalProjects: 0,
      activeTasks: 0,
      completedTasks: 0,
      blockedTasks: 0,
      overdueTasks: 0,
      openConflicts: 0
    };
  }

  async loadStats() {
    try {
      // In demo mode, use mock data
      if (CONFIG.DEMO_MODE) {
        const allProjects = await projects.getProjects();
        const allTasks = await tasks.getTasks(1);
        
        this.stats = {
          totalProjects: allProjects.length,
          activeTasks: allTasks.filter(t => t.status === 'in_progress').length,
          completedTasks: allTasks.filter(t => t.status === 'done').length,
          blockedTasks: allTasks.filter(t => t.status === 'blocked').length,
          overdueTasks: 1,
          openConflicts: 2
        };
      } else {
        // Fetch from API
        const allProjects = await projects.getProjects();
        this.stats.totalProjects = allProjects.length;
        
        // Calculate task stats from all projects
        let activeTasks = 0;
        let completedTasks = 0;
        let blockedTasks = 0;
        
        for (const project of allProjects) {
          const projectTasks = await tasks.getTasks(project.id);
          activeTasks += projectTasks.filter(t => t.status === 'in_progress').length;
          completedTasks += projectTasks.filter(t => t.status === 'done').length;
          blockedTasks += projectTasks.filter(t => t.status === 'blocked').length;
        }
        
        this.stats.activeTasks = activeTasks;
        this.stats.completedTasks = completedTasks;
        this.stats.blockedTasks = blockedTasks;
        
        // Get conflicts
        const allConflicts = await conflicts.getConflicts();
        this.stats.openConflicts = allConflicts.filter(c => c.status === 'open').length;
      }
      
      return this.stats;
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      throw error;
    }
  }

  async loadRecentActivity() {
    try {
      const activities = await activity.getActivity();
      return activities.slice(0, 10);
    } catch (error) {
      console.error('Error loading recent activity:', error);
      throw error;
    }
  }

  async loadOpenConflicts() {
    try {
      const allConflicts = await conflicts.getConflicts();
      return allConflicts.filter(c => c.status === 'open').slice(0, 5);
    } catch (error) {
      console.error('Error loading open conflicts:', error);
      throw error;
    }
  }

  async loadUpcomingDeadlines() {
    try {
      // In demo mode, return mock data
      if (CONFIG.DEMO_MODE) {
        return [
          { task: 'Authentication API', deadline: '2026-10-15', days: 3 },
          { task: 'WebSocket Integration', deadline: '2026-10-18', days: 6 },
          { task: 'Dashboard UI', deadline: '2026-10-20', days: 8 }
        ];
      }
      
      // Fetch from API
      const allProjects = await projects.getProjects();
      const deadlines = [];
      
      for (const project of allProjects) {
        const projectTasks = await tasks.getTasks(project.id);
        const now = new Date();
        
        for (const task of projectTasks) {
          if (task.deadline && task.status !== 'done') {
            const deadline = new Date(task.deadline);
            const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
            
            if (daysUntil <= 30) {
              deadlines.push({
                task: task.title,
                deadline: task.deadline,
                days: daysUntil
              });
            }
          }
        }
      }
      
      return deadlines.sort((a, b) => a.days - b.days).slice(0, 5);
    } catch (error) {
      console.error('Error loading upcoming deadlines:', error);
      throw error;
    }
  }

  async refresh() {
    try {
      notifications.show('info', 'Refreshing dashboard...');
      await Promise.all([
        this.loadStats(),
        this.loadRecentActivity(),
        this.loadOpenConflicts(),
        this.loadUpcomingDeadlines()
      ]);
      notifications.show('success', 'Dashboard refreshed successfully');
      
      // Re-render dashboard if on dashboard page
      if (window.location.hash === '#/dashboard' || window.location.hash === '') {
        window.app.handleRoute();
      }
      
      return this.stats;
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      notifications.show('error', 'Failed to refresh dashboard');
      throw error;
    }
  }
}

const dashboard = new DashboardManager();
