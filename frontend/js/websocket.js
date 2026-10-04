// WebSocket Module
class WebSocketManager {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = CONFIG.WEBSOCKET.maxReconnectAttempts;
    this.reconnectInterval = CONFIG.WEBSOCKET.reconnectInterval;
    this.listeners = new Map();
    this.currentProjectId = null;
  }

  connect(projectId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.disconnect();
    }

    this.currentProjectId = projectId;
    const wsUrl = `${CONFIG.WS_BASE_URL}/ws/projects/${projectId}`;

    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        notifications.show('success', '✓ Connected to real-time updates');
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.attemptReconnect();
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      notifications.show('warning', `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.currentProjectId) {
          this.connect(this.currentProjectId);
        }
      }, this.reconnectInterval);
    } else {
      notifications.show('error', 'Failed to reconnect. Please refresh the page.');
    }
  }

  handleMessage(data) {
    const { type, payload } = data;
    
    // Notify all listeners for this event type
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(callback => callback(payload));
    }

    // Handle specific event types
    switch (type) {
      case 'TASK_UPDATED':
        this.handleTaskUpdated(payload);
        break;
      case 'CONFLICT_DETECTED':
        this.handleConflictDetected(payload);
        break;
      case 'CONFLICT_RESOLVED':
        this.handleConflictResolved(payload);
        break;
      case 'USER_ONLINE':
        this.handleUserOnline(payload);
        break;
      case 'USER_OFFLINE':
        this.handleUserOffline(payload);
        break;
    }
  }

  handleTaskUpdated(payload) {
    notifications.show('info', `Task updated: ${payload.title}`);
    // Refresh task data if on task page
    if (window.location.hash.includes(`/task?id=${payload.id}`)) {
      // Reload task data
    }
  }

  handleConflictDetected(payload) {
    notifications.show('danger', `⚠ Conflict detected in ${payload.task_title}`);
    // Trigger 3D conflict visualization
    if (window.conflictVisual) {
      window.conflictVisual.showConflict();
    }
  }

  handleConflictResolved(payload) {
    notifications.show('success', `✓ Conflict resolved in ${payload.task_title}`);
  }

  handleUserOnline(payload) {
    console.log(`User ${payload.user_id} is now online`);
  }

  handleUserOffline(payload) {
    console.log(`User ${payload.user_id} is now offline`);
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

const websocket = new WebSocketManager();
