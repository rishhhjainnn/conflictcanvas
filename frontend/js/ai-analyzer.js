// AI Agent Analyzer
class AiAnalyzer {
  constructor() {
    this.storageKey = 'conflictcanvas_ai_launch_history';
    this.providers = [
      { id: 'claude', name: 'Claude', description: 'Anthropic assistant', url: 'https://claude.ai/new', icon: 'sparkles', color: '#e8a06a' },
      { id: 'chatgpt', name: 'ChatGPT', description: 'OpenAI assistant', url: 'https://chatgpt.com/', icon: 'message-circle', color: '#55c9a5' },
      { id: 'nemotron', name: 'Nemotron', description: 'NVIDIA model platform', url: 'https://build.nvidia.com/', icon: 'cpu', color: '#76b900' },
      { id: 'codex', name: 'Codex', description: 'OpenAI coding agent', url: 'https://chatgpt.com/codex', icon: 'code-2', color: '#65b8e8' }
    ];
    this.history = this.loadHistory();
    this.projects = [];
  }

  async initialize() {
    this.projects = await projects.getProjects();
    this.renderProjectOptions();
    this.renderAgents();
    this.renderHistory();

    const projectSelect = document.getElementById('ai-project-select');
    const taskSelect = document.getElementById('ai-task-select');
    const focusInput = document.getElementById('ai-analysis-focus');
    const contextToggle = document.getElementById('ai-include-context');

    projectSelect.addEventListener('change', () => this.updateTaskOptions());
    taskSelect.addEventListener('change', () => this.updatePreview());
    focusInput.addEventListener('input', () => this.updatePreview());
    contextToggle.addEventListener('change', () => this.updatePreview());
    document.getElementById('ai-copy-brief').addEventListener('click', () => this.copyBrief());
    document.getElementById('ai-clear-history').addEventListener('click', () => this.clearHistory());
    document.getElementById('ai-agent-grid').addEventListener('click', (event) => {
      const link = event.target.closest('[data-agent-id]');
      if (link) this.recordLaunch(link.dataset.agentId);
    });

    await this.updateTaskOptions();
  }

  loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]').slice(0, 8);
    } catch (error) {
      console.error('Error loading AI agent history:', error);
      return [];
    }
  }

  renderProjectOptions() {
    const select = document.getElementById('ai-project-select');
    select.replaceChildren(new Option('Workspace overview', ''));
    this.projects.forEach(project => select.add(new Option(project.name, String(project.id))));
    if (this.projects.length) select.value = String(this.projects[0].id);
  }

  async updateTaskOptions() {
    const projectId = document.getElementById('ai-project-select').value;
    const taskSelect = document.getElementById('ai-task-select');
    let projectTasks = [];

    if (projectId) {
      if (CONFIG.DEMO_MODE) {
        if (tasks.tasks.length === 0) await tasks.getTasks(Number(projectId));
        projectTasks = tasks.tasks.filter(task => String(task.project_id) === projectId);
      } else {
        projectTasks = await tasks.getTasks(projectId);
      }
    }

    taskSelect.replaceChildren(new Option('Project overview', ''));
    projectTasks.forEach(task => taskSelect.add(new Option(task.title, String(task.id))));
    if (projectTasks.length) taskSelect.value = String(projectTasks[0].id);
    this.updatePreview();
  }

  renderAgents() {
    const container = document.getElementById('ai-agent-grid');
    document.getElementById('ai-agent-count').textContent = `${this.providers.length} agents`;
    container.innerHTML = this.providers.map(provider => {
      const lastLaunch = this.history.find(entry => entry.providerId === provider.id);
      const lastUsed = lastLaunch ? `Last opened ${this.formatTime(lastLaunch.openedAt)}` : 'Not opened yet';
      return `
        <article class="ai-agent-card" style="--agent-accent: ${provider.color}">
          <span class="ai-agent-icon"><i data-lucide="${provider.icon}"></i></span>
          <h3 class="ai-agent-name">${provider.name}</h3>
          <p class="ai-agent-description">${provider.description}</p>
          <p class="ai-agent-last-used">${lastUsed}</p>
          <a class="btn btn-secondary ai-agent-launch" href="${provider.url}" target="_blank" rel="noopener noreferrer" data-agent-id="${provider.id}" aria-label="Open ${provider.name} in a new tab">
            Open ${provider.name}
            <i data-lucide="arrow-up-right"></i>
          </a>
        </article>
      `;
    }).join('');
    lucide.createIcons();
  }

  renderHistory() {
    const container = document.getElementById('ai-launch-history');
    container.replaceChildren();
    if (!this.history.length) {
      const empty = document.createElement('p');
      empty.className = 'ai-history-empty';
      empty.textContent = 'No agent launches recorded in this browser yet.';
      container.append(empty);
      return;
    }

    this.history.slice(0, 5).forEach(entry => {
      const row = document.createElement('div');
      row.className = 'ai-history-row';
      const context = document.createElement('div');
      const agent = document.createElement('p');
      agent.className = 'ai-history-agent';
      agent.textContent = entry.providerName;
      const details = document.createElement('p');
      details.className = 'ai-history-context';
      details.textContent = [entry.projectName, entry.taskTitle].filter(Boolean).join(' / ') || 'Workspace overview';
      const time = document.createElement('time');
      time.className = 'ai-history-time';
      time.dateTime = entry.openedAt;
      time.textContent = this.formatTime(entry.openedAt);
      context.append(agent, details);
      row.append(context, time);
      container.append(row);
    });
  }

  buildBrief() {
    const projectId = document.getElementById('ai-project-select').value;
    const taskId = document.getElementById('ai-task-select').value;
    const project = this.projects.find(item => String(item.id) === projectId);
    const task = tasks.tasks.find(item => String(item.id) === taskId);
    const focus = document.getElementById('ai-analysis-focus').value.trim();
    const includeContext = document.getElementById('ai-include-context').checked;
    const lines = [
      'Analyze this project context and return concise, evidence-based recommendations.',
      `Analysis focus: ${focus || 'Identify risks, dependencies, and actionable next steps.'}`
    ];

    if (includeContext && project) {
      lines.push('', `Project: ${project.name}`, `Project status: ${project.status || 'unknown'}`);
      if (project.description) lines.push(`Project description: ${project.description}`);
    }
    if (includeContext && task) {
      lines.push('', `Task: ${task.title}`, `Task status: ${task.status || 'unknown'}`);
      if (task.description) lines.push(`Task description: ${task.description}`);
      if (task.deadline) lines.push(`Deadline: ${task.deadline}`);
    }

    lines.push('', 'Please include assumptions, key risks, and the next three concrete actions.');
    return lines.join('\n');
  }

  updatePreview() {
    const preview = document.getElementById('ai-brief-preview');
    if (preview) preview.textContent = this.buildBrief();
  }

  async copyBrief() {
    const status = document.getElementById('ai-copy-status');
    try {
      await navigator.clipboard.writeText(this.buildBrief());
      status.textContent = 'Brief copied to clipboard.';
    } catch (error) {
      status.textContent = 'Clipboard access is unavailable. The brief remains visible above.';
    }
  }

  recordLaunch(providerId) {
    const provider = this.providers.find(item => item.id === providerId);
    if (!provider) return;

    const projectId = document.getElementById('ai-project-select').value;
    const taskId = document.getElementById('ai-task-select').value;
    const project = this.projects.find(item => String(item.id) === projectId);
    const task = tasks.tasks.find(item => String(item.id) === taskId);
    const entry = {
      providerId: provider.id,
      providerName: provider.name,
      projectName: project?.name || '',
      taskTitle: task?.title || '',
      openedAt: new Date().toISOString()
    };

    this.history.unshift(entry);
    this.history = this.history.slice(0, 8);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (error) {
      console.error('Error saving AI agent history:', error);
    }
    const agentCard = document.querySelector(`[data-agent-id="${provider.id}"]`)?.closest('.ai-agent-card');
    const lastUsed = agentCard?.querySelector('.ai-agent-last-used');
    if (lastUsed) lastUsed.textContent = `Last opened ${this.formatTime(entry.openedAt)}`;
    this.renderHistory();
    this.copyBrief();
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem(this.storageKey);
    this.renderAgents();
    this.renderHistory();
  }

  formatTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown time';
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
}

const aiAnalyzer = new AiAnalyzer();
