// Conflicts Module
class ConflictsManager {
  constructor() {
    this.conflicts = [];
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONFLICTS);
      if (stored) {
        this.conflicts = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading conflicts from storage:', error);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(this.conflicts));
    } catch (error) {
      console.error('Error saving conflicts to storage:', error);
    }
  }

  async getConflicts() {
    try {
      if (CONFIG.DEMO_MODE) {
        // Use stored conflicts or return empty
        return this.conflicts;
      }
      this.conflicts = await api.getConflicts();
      this.saveToStorage();
      return this.conflicts;
    } catch (error) {
      console.error('Error fetching conflicts:', error);
      // Return stored data as fallback
      return this.conflicts;
    }
  }

  async getConflict(conflictId) {
    try {
      const conflict = await api.getConflict(conflictId);
      return conflict;
    } catch (error) {
      console.error('Error fetching conflict:', error);
      // Return from local storage as fallback
      return this.conflicts.find(c => c.id === conflictId);
    }
  }

  async resolveConflict(conflictId, resolution) {
    try {
      const resolved = await api.resolveConflict(conflictId, { resolution });
      
      // Update local conflicts array
      const index = this.conflicts.findIndex(c => c.id === conflictId);
      if (index > -1) {
        this.conflicts[index] = resolved;
      }
      
      this.saveToStorage();
      notifications.show('success', 'Conflict resolved successfully');
      return resolved;
    } catch (error) {
      console.error('Error resolving conflict:', error);
      notifications.show('error', 'Failed to resolve conflict');
      throw error;
    }
  }

  async refresh() {
    try {
      notifications.show('info', 'Refreshing conflicts...');
      await this.getConflicts();
      notifications.show('success', 'Conflicts refreshed successfully');
      return this.conflicts;
    } catch (error) {
      console.error('Error refreshing conflicts:', error);
      notifications.show('error', 'Failed to refresh conflicts');
      throw error;
    }
  }

  getOpenConflicts() {
    return this.conflicts.filter(c => c.status === 'open');
  }

  getResolvedConflicts() {
    return this.conflicts.filter(c => c.status === 'resolved');
  }

  getConflictsByTask(taskId) {
    return this.conflicts.filter(c => c.task_id === taskId);
  }

  getConflictsByUser(userId) {
    return this.conflicts.filter(c => c.user_id === userId);
  }
}

const conflicts = new ConflictsManager();
