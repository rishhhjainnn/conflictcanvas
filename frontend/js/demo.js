// Demo Module - Live Conflict Simulation
class Demo {
  constructor() {
    this.active = false;
    this.currentUser = null;
    this.otherUser = null;
    this.task = null;
  }

  start() {
    this.active = true;
    this.currentUser = DEMO_USERS[0]; // Kunal
    this.otherUser = DEMO_USERS[1]; // Maan
    this.task = { ...DEMO_TASKS[0] }; // Authentication API
    
    // Reset to version 7
    this.task.version = 7;
    
    this.showDemoUI();
  }

  showDemoUI() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'demo-modal';
    modal.innerHTML = `
      <div class="modal demo-modal">
        <div class="modal-header">
          <div class="flex items-center gap-3">
            <div class="demo-icon">
              <i data-lucide="play-circle"></i>
            </div>
            <div>
              <h2 class="font-heading text-xl">Live Conflict Demo</h2>
              <p class="text-sm text-muted">See how ConflictCanvas prevents data loss</p>
            </div>
          </div>
          <button class="navbar-icon-btn" onclick="document.getElementById('demo-modal').remove()">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <!-- Explanation Section -->
          <div class="demo-explanation mb-4">
            <div class="flex items-start gap-3 p-4 bg-surface rounded-lg">
              <i data-lucide="info" class="text-primary mt-1"></i>
              <div>
                <h4 class="font-heading text-md mb-2">How Conflict Resolution Works</h4>
                <ol class="text-sm text-muted space-y-2">
                  <li><strong>Step 1:</strong> Two users open the same task (both see Version ${this.task.version})</li>
                  <li><strong>Step 2:</strong> Both users make changes simultaneously</li>
                  <li><strong>Step 3:</strong> ConflictCanvas detects the version mismatch</li>
                  <li><strong>Step 4:</strong> You choose which version to keep (no silent overwrites!)</li>
                </ol>
              </div>
            </div>
          </div>

          <!-- Task Preview -->
          <div class="card mb-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-heading text-lg">Task: ${this.task.title}</h3>
              <div class="flex items-center gap-2">
                <span class="version-badge">v${this.task.version}</span>
                <span class="badge badge-${this.getPriorityClass(this.task.priority)}">${this.task.priority.toUpperCase()}</span>
              </div>
            </div>
            <p class="text-sm text-muted mb-3">${this.task.description}</p>
            
            <!-- Version Timeline -->
            <div class="version-timeline">
              <div class="version-step">
                <div class="version-dot current"></div>
                <div class="version-label">
                  <span class="font-mono text-sm">v${this.task.version}</span>
                  <span class="text-xs text-muted">Current Version</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Users Section -->
          <div class="demo-users mb-4">
            <h4 class="font-heading text-md mb-3">Simulating Two Users</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="demo-user-card active">
                <div class="flex items-center gap-3 mb-3">
                  <div class="avatar avatar-lg">${this.currentUser.avatar}</div>
                  <div>
                    <div class="font-heading">${this.currentUser.name}</div>
                    <div class="text-xs text-muted">Base Version: v${this.task.version}</div>
                  </div>
                  <span class="badge badge-success ml-auto">YOU</span>
                </div>
                <div>
                  <label class="text-sm text-muted block mb-2">Your Change:</label>
                  <select id="demo-user-a-change" class="input">
                    <option value="status=done">Status → DONE</option>
                    <option value="priority=critical">Priority → CRITICAL</option>
                  </select>
                </div>
              </div>
              
              <div class="demo-user-card">
                <div class="flex items-center gap-3 mb-3">
                  <div class="avatar avatar-lg">${this.otherUser.avatar}</div>
                  <div>
                    <div class="font-heading">${this.otherUser.name}</div>
                    <div class="text-xs text-muted">Base Version: v${this.task.version}</div>
                  </div>
                </div>
                <div>
                  <label class="text-sm text-muted block mb-2">Their Change:</label>
                  <select id="demo-user-b-change" class="input">
                    <option value="status=in_review">Status → IN_REVIEW</option>
                    <option value="priority=high">Priority → HIGH</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Conflict Type Indicator -->
          <div class="conflict-type-indicator mb-4">
            <div class="flex items-center gap-2 p-3 bg-surface rounded-lg">
              <i data-lucide="alert-triangle" class="text-warning"></i>
              <span class="text-sm">
                <strong>Tip:</strong> Try changing the <span class="text-primary">same field</span> to see a true conflict, or <span class="text-success">different fields</span> to see smart merge.
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('demo-modal').remove()">
            Cancel
          </button>
          <button class="btn btn-primary btn-lg" onclick="demo.runConflictSimulation()">
            <i data-lucide="play"></i>
            Start Simulation
          </button>
        </div>
      </div>
    `;
    
    document.getElementById('modal-container').appendChild(modal);
    lucide.createIcons();
  }

  async runConflictSimulation() {
    const userAChange = document.getElementById('demo-user-a-change').value;
    const userBChange = document.getElementById('demo-user-b-change').value;
    document.getElementById('demo-modal').remove();
    
    // Parse changes
    const [fieldA, valueA] = userAChange.split('=');
    const [fieldB, valueB] = userBChange.split('=');
    
    // Show notification
    notifications.show('info', 'Starting conflict simulation...');
    
    // Simulate User A's change
    await this.simulateDelay(1000);
    notifications.show('success', `${this.currentUser.name} changed ${fieldA} → ${valueA.toUpperCase()}`);
    
    // Update task on server
    this.task.version = 8;
    this.task[fieldA] = valueA;
    
    // Simulate User B's change (with stale version)
    await this.simulateDelay(1500);
    notifications.show('warning', `${this.otherUser.name} is trying to change ${fieldB} → ${valueB.toUpperCase()}`);
    
    // Check for conflict
    await this.simulateDelay(1000);
    
    if (fieldA === fieldB) {
      // Same field - true conflict
      this.showConflictResolution(fieldA, valueA, valueB);
    } else {
      // Different fields - smart merge
      this.showSmartMerge(fieldA, valueA, fieldB, valueB);
    }
  }

  showConflictResolution(field, valueA, valueB) {
    notifications.show('danger', '⚠ CONFLICT DETECTED');
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'conflict-modal';
    modal.innerHTML = `
      <div class="modal conflict-modal">
        <div class="modal-header">
          <div class="flex items-center gap-3">
            <div class="conflict-icon">
              <i data-lucide="alert-triangle"></i>
            </div>
            <div>
              <h2 class="font-heading text-xl text-danger">CONFLICT DETECTED</h2>
              <p class="text-sm text-muted">Both users changed the same field</p>
            </div>
          </div>
          <button class="navbar-icon-btn" onclick="document.getElementById('conflict-modal').remove()">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <!-- Explanation -->
          <div class="conflict-explanation mb-4">
            <div class="flex items-start gap-3 p-4 bg-surface rounded-lg">
              <i data-lucide="info" class="text-primary mt-1"></i>
              <div class="text-sm text-muted">
                <p class="mb-2"><strong>What happened?</strong></p>
                <p>${this.currentUser.name} and ${this.otherUser.name} both edited the <strong>${field}</strong> field at the same time. You need to choose which version to keep.</p>
              </div>
            </div>
          </div>

          <!-- Version Comparison -->
          <div class="version-comparison mb-4">
            <h4 class="font-heading text-md mb-3">Choose Which Version to Keep</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="conflict-option-card" onclick="demo.resolveConflict('mine', '${field}', '${valueA}')">
                <div class="conflict-option-header">
                  <div class="avatar avatar-sm">${this.currentUser.avatar}</div>
                  <div>
                    <div class="font-heading">${this.currentUser.name}</div>
                    <div class="text-xs text-muted">Your version</div>
                  </div>
                  <span class="badge badge-success ml-auto">YOU</span>
                </div>
                <div class="conflict-option-value">
                  <span class="text-muted">${field} →</span>
                  <span class="font-mono text-primary">${valueA.toUpperCase()}</span>
                </div>
                <div class="conflict-option-footer">
                  <i data-lucide="check"></i>
                  <span>Keep My Version</span>
                </div>
              </div>

              <div class="conflict-option-card" onclick="demo.resolveConflict('latest', '${field}', '${valueB}')">
                <div class="conflict-option-header">
                  <div class="avatar avatar-sm">${this.otherUser.avatar}</div>
                  <div>
                    <div class="font-heading">${this.otherUser.name}</div>
                    <div class="text-xs text-muted">Latest version</div>
                  </div>
                </div>
                <div class="conflict-option-value">
                  <span class="text-muted">${field} →</span>
                  <span class="font-mono text-danger">${valueB.toUpperCase()}</span>
                </div>
                <div class="conflict-option-footer">
                  <i data-lucide="git-merge"></i>
                  <span>Keep Latest</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Version Info -->
          <div class="version-info">
            <div class="flex items-center gap-2 p-3 bg-surface rounded-lg">
              <i data-lucide="git-commit" class="text-muted"></i>
              <span class="text-sm text-muted">
                <strong>Server Version:</strong> v${this.task.version} | 
                <strong>Your Base:</strong> v${this.task.version - 1}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('conflict-modal').remove()">
            Cancel
          </button>
        </div>
      </div>
    `;
    
    document.getElementById('modal-container').appendChild(modal);
    lucide.createIcons();
  }

  showSmartMerge(fieldA, valueA, fieldB, valueB) {
    notifications.show('success', '✓ Changes automatically merged');
    
    // Apply both changes
    this.task[fieldA] = valueA;
    this.task[fieldB] = valueB;
    this.task.version = 9;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'merge-modal';
    modal.innerHTML = `
      <div class="modal merge-modal">
        <div class="modal-header">
          <div class="flex items-center gap-3">
            <div class="merge-icon">
              <i data-lucide="check-circle"></i>
            </div>
            <div>
              <h2 class="font-heading text-xl text-success">Smart Merge</h2>
              <p class="text-sm text-muted">Changes were automatically merged</p>
            </div>
          </div>
          <button class="navbar-icon-btn" onclick="document.getElementById('merge-modal').remove()">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-body">
          <!-- Explanation -->
          <div class="merge-explanation mb-4">
            <div class="flex items-start gap-3 p-4 bg-surface rounded-lg">
              <i data-lucide="info" class="text-primary mt-1"></i>
              <div class="text-sm text-muted">
                <p class="mb-2"><strong>What happened?</strong></p>
                <p>${this.currentUser.name} changed <strong>${fieldA}</strong> and ${this.otherUser.name} changed <strong>${fieldB}</strong>. Since they modified different fields, both changes were merged automatically.</p>
              </div>
            </div>
          </div>

          <!-- Merged Result -->
          <div class="merged-result mb-4">
            <h4 class="font-heading text-md mb-3">Merged Result</h4>
            <div class="card" style="border-color: var(--success);">
              <div class="flex items-center gap-2 mb-3">
                <i data-lucide="git-merge" class="text-success"></i>
                <span class="font-heading">Both Changes Applied</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="merge-field">
                  <p class="text-sm text-muted mb-1">${fieldA}</p>
                  <p class="font-mono text-primary">${valueA.toUpperCase()}</p>
                </div>
                <div class="merge-field">
                  <p class="text-sm text-muted mb-1">${fieldB}</p>
                  <p class="font-mono text-success">${valueB.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Version Info -->
          <div class="version-info">
            <div class="flex items-center gap-2 p-3 bg-surface rounded-lg">
              <i data-lucide="git-commit" class="text-success"></i>
              <span class="text-sm text-muted">
                <strong>Task Version:</strong> v${this.task.version} (both changes merged)
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-success" onclick="document.getElementById('merge-modal').remove()">
            <i data-lucide="check"></i>
            Done
          </button>
        </div>
      </div>
    `;
    
    document.getElementById('modal-container').appendChild(modal);
    lucide.createIcons();
  }

  resolveConflict(choice, field, value) {
    document.getElementById('conflict-modal').remove();
    
    if (choice === 'mine') {
      this.task[field] = value;
      notifications.show('success', `✓ Kept your version: ${value.toUpperCase()}`);
    } else {
      this.task[field] = value;
      notifications.show('success', `✓ Kept latest version: ${value.toUpperCase()}`);
    }
    
    this.task.version = 9;
    
    // Show success modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'resolved-modal';
    modal.innerHTML = `
      <div class="modal" style="border-color: var(--success);">
        <div class="modal-header" style="border-color: var(--success);">
          <div class="flex items-center gap-2">
            <i data-lucide="check-circle" style="color: var(--success);"></i>
            <h2 class="font-heading text-xl text-success">Conflict Resolved</h2>
          </div>
        </div>
        <div class="modal-body">
          <p class="text-muted mb-4">
            The conflict has been resolved and synchronized to all users.
          </p>
          
          <div class="card mb-4" style="border-color: var(--success);">
            <div class="flex items-center gap-2 mb-2">
              <span class="font-heading">Task: ${this.task.title}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-muted">${field} →</span>
              <span class="font-mono text-success">${value.toUpperCase()}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 p-3 bg-surface rounded">
            <i data-lucide="git-merge" style="color: var(--success);"></i>
            <span class="text-sm">Task Version: ${this.task.version}</span>
          </div>
        </div>
        <div class="modal-footer" style="border-color: var(--success);">
          <button class="btn btn-success" onclick="document.getElementById('resolved-modal').remove()">
            Done
          </button>
        </div>
      </div>
    `;
    
    document.getElementById('modal-container').appendChild(modal);
    lucide.createIcons();
    
    // Trigger 3D conflict visualization
    if (window.conflictVisual) {
      window.conflictVisual.showResolution();
    }
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

  simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const demo = new Demo();
