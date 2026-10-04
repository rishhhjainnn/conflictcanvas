// Tasks Module
class TasksManager {
  constructor() {
    this.tasks = [];
    this.currentTask = null;
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (stored) {
        this.tasks = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading tasks from storage:', error);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Error saving tasks to storage:', error);
    }
  }

  async getTasks(projectId) {
    try {
      if (CONFIG.DEMO_MODE) {
        // Use stored data or demo data
        if (this.tasks.length === 0) {
          this.tasks = DEMO_TASKS;
          this.saveToStorage();
        }
        return this.tasks.filter(t => t.project_id === projectId);
      }
      this.tasks = await api.getTasks(projectId);
      this.saveToStorage();
      return this.tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Return stored data as fallback
      return this.tasks.filter(t => t.project_id === projectId);
    }
  }

  async getTask(taskId) {
    try {
      if (CONFIG.DEMO_MODE) {
        this.currentTask = this.tasks.find(t => t.id === taskId) || DEMO_TASKS[0];
        return this.currentTask;
      }
      this.currentTask = await api.getTask(taskId);
      return this.currentTask;
    } catch (error) {
      console.error('Error fetching task:', error);
      // Return from local storage as fallback
      this.currentTask = this.tasks.find(t => t.id === taskId);
      return this.currentTask;
    }
  }

  async createTask(taskData) {
    try {
      const newTask = await api.createTask(taskData);
      this.tasks.push(newTask);
      this.saveToStorage();
      notifications.show('success', 'Task created successfully');
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      notifications.show('error', 'Failed to create task');
      throw error;
    }
  }

  async updateTask(taskId, taskData) {
    try {
      const updatedTask = await api.updateTask(taskId, taskData);
      
      // Update local tasks array
      const index = this.tasks.findIndex(t => t.id === taskId);
      if (index > -1) {
        this.tasks[index] = updatedTask;
      }
      
      if (this.currentTask && this.currentTask.id === taskId) {
        this.currentTask = updatedTask;
      }
      
      this.saveToStorage();
      notifications.show('success', 'Task updated successfully');
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      
      if (error.message === 'CONFLICT_DETECTED') {
        notifications.show('danger', '⚠ Conflict detected! Please resolve it.');
        // Open conflict resolution modal
        this.showConflictResolution(taskId, taskData);
      } else {
        notifications.show('error', 'Failed to update task');
      }
      
      throw error;
    }
  }

  async deleteTask(taskId) {
    try {
      await api.deleteTask(taskId);
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.saveToStorage();
      notifications.show('success', 'Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      notifications.show('error', 'Failed to delete task');
      throw error;
    }
  }

  async refresh(projectId) {
    try {
      notifications.show('info', 'Refreshing tasks...');
      await this.getTasks(projectId);
      notifications.show('success', 'Tasks refreshed successfully');
      return this.tasks;
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      notifications.show('error', 'Failed to refresh tasks');
      throw error;
    }
  }

  showConflictResolution(taskId, taskData) {
    // This would open the conflict resolution modal
    // For now, redirect to demo
    demo.start();
  }

  getTasksByStatus(status) {
    return this.tasks.filter(t => t.status === status);
  }

  getTasksByAssignee(userId) {
    return this.tasks.filter(t => t.assigned_to === userId);
  }

  getTasksByPriority(priority) {
    return this.tasks.filter(t => t.priority === priority);
  }
}

const tasks = new TasksManager();
