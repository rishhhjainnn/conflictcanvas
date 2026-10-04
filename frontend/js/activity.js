// Activity Module
class ActivityManager {
  constructor() {
    this.activities = [];
  }

  async getActivity(projectId = null) {
    try {
      if (projectId) {
        this.activities = await api.getActivity(projectId);
      } else {
        // For demo, return mock data
        this.activities = this.getMockActivities();
      }
      return this.activities;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  }

  getMockActivities() {
    return [
      {
        id: 1,
        user_id: 1,
        user_name: 'Kunal',
        action: 'conflict_detected',
        entity_type: 'task',
        entity_id: 1,
        entity_name: 'Authentication API',
        details: 'Status conflict detected',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        user_id: 2,
        user_name: 'Maan',
        action: 'task_updated',
        entity_type: 'task',
        entity_id: 2,
        entity_name: 'Dashboard UI',
        details: 'Priority changed to HIGH',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        user_id: 4,
        user_name: 'Aashish',
        action: 'comment_added',
        entity_type: 'task',
        entity_id: 4,
        entity_name: 'WebSocket Integration',
        details: 'Added comment',
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 4,
        user_id: 3,
        user_name: 'Nitya',
        action: 'task_completed',
        entity_type: 'task',
        entity_id: 3,
        entity_name: 'Database Schema',
        details: 'Task marked as done',
        created_at: new Date(Date.now() - 10800000).toISOString()
      }
    ];
  }

  getActivitiesByType(type) {
    return this.activities.filter(a => a.action === type);
  }

  getActivitiesByUser(userId) {
    return this.activities.filter(a => a.user_id === userId);
  }

  getActivitiesByProject(projectId) {
    return this.activities.filter(a => a.project_id === projectId);
  }
}

const activity = new ActivityManager();
