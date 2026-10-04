// Configuration
const CONFIG = {
  // API Configuration
  API_BASE_URL: 'http://localhost:8000',
  WS_BASE_URL: 'ws://localhost:8000',
  
  // App Configuration
  APP_NAME: 'ConflictCanvas',
  APP_VERSION: '1.0.0',
  
  // Demo Mode
  DEMO_MODE: true,
  
  // Three.js Configuration
  THREE: {
    enabled: true,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    antialias: true,
    alpha: true
  },
  
  // Animation Configuration
  ANIMATION: {
    enabled: true,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },
  
  // WebSocket Configuration
  WEBSOCKET: {
    reconnectInterval: 3000,
    maxReconnectAttempts: 5
  },
  
  // File Upload Configuration
  FILE_UPLOAD: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'text/csv',
      'application/zip'
    ]
  },
  
  // Pagination
  PAGINATION: {
    defaultLimit: 20,
    maxLimit: 100
  }
};

// Demo Users
const DEMO_USERS = [
  { id: 1, name: 'Kunal', email: 'kunal@demo.com', avatar: 'K', online: true },
  { id: 2, name: 'Maan', email: 'maan@demo.com', avatar: 'M', online: true },
  { id: 3, name: 'Nitya', email: 'nitya@demo.com', avatar: 'N', online: false },
  { id: 4, name: 'Aashish', email: 'aashish@demo.com', avatar: 'A', online: true },
  { id: 5, name: 'Hardika', email: 'hardika@demo.com', avatar: 'H', online: false },
  { id: 6, name: 'Divyanshi', email: 'divyanshi@demo.com', avatar: 'D', online: true }
];

// Demo Project
const DEMO_PROJECT = {
  id: 1,
  name: 'ConflictCanvas Platform',
  description: 'Building the future of real-time collaboration with intelligent conflict resolution',
  status: 'active',
  priority: 'high',
  progress: 65,
  deadline: '2026-12-31',
  team: DEMO_USERS.slice(0, 4)
};

// Demo Tasks
const DEMO_TASKS = [
  {
    id: 1,
    project_id: 1,
    title: 'Authentication API',
    description: 'Implement JWT-based authentication system with refresh tokens',
    status: 'in_review',
    priority: 'high',
    assigned_to: 1,
    deadline: '2026-10-15',
    version: 7,
    created_by: 1,
    updated_by: 2,
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-04T10:42:00Z',
    comments: [],
    attachments: []
  },
  {
    id: 2,
    project_id: 1,
    title: 'Dashboard UI',
    description: 'Create responsive dashboard with real-time statistics',
    status: 'in_progress',
    priority: 'medium',
    assigned_to: 2,
    deadline: '2026-10-20',
    version: 5,
    created_by: 2,
    updated_by: 2,
    created_at: '2026-10-02T09:00:00Z',
    updated_at: '2026-10-04T09:30:00Z',
    comments: [],
    attachments: []
  },
  {
    id: 3,
    project_id: 1,
    title: 'Database Schema',
    description: 'Design PostgreSQL schema for users, projects, tasks, and conflicts',
    status: 'done',
    priority: 'high',
    assigned_to: 3,
    deadline: '2026-10-05',
    version: 12,
    created_by: 3,
    updated_by: 3,
    created_at: '2026-10-01T08:00:00Z',
    updated_at: '2026-10-03T16:00:00Z',
    comments: [],
    attachments: []
  },
  {
    id: 4,
    project_id: 1,
    title: 'WebSocket Integration',
    description: 'Implement real-time updates using WebSockets',
    status: 'in_progress',
    priority: 'high',
    assigned_to: 4,
    deadline: '2026-10-18',
    version: 4,
    created_by: 4,
    updated_by: 4,
    created_at: '2026-10-02T11:00:00Z',
    updated_at: '2026-10-04T11:00:00Z',
    comments: [],
    attachments: []
  },
  {
    id: 5,
    project_id: 1,
    title: 'Conflict Resolver',
    description: 'Build intelligent conflict detection and resolution system',
    status: 'todo',
    priority: 'critical',
    assigned_to: 1,
    deadline: '2026-10-25',
    version: 2,
    created_by: 1,
    updated_by: 1,
    created_at: '2026-10-03T14:00:00Z',
    updated_at: '2026-10-03T14:00:00Z',
    comments: [],
    attachments: []
  },
  {
    id: 6,
    project_id: 1,
    title: 'File Upload System',
    description: 'Implement secure file upload with validation',
    status: 'todo',
    priority: 'medium',
    assigned_to: 5,
    deadline: '2026-10-22',
    version: 1,
    created_by: 5,
    updated_by: 5,
    created_at: '2026-10-04T08:00:00Z',
    updated_at: '2026-10-04T08:00:00Z',
    comments: [],
    attachments: []
  }
];

// Local Storage Keys
const STORAGE_KEYS = {
  TOKEN: 'conflictcanvas_token',
  USER: 'conflictcanvas_user',
  THEME: 'conflictcanvas_theme',
  SIDEBAR_COLLAPSED: 'conflictcanvas_sidebar_collapsed',
  PROJECTS: 'conflictcanvas_projects',
  TASKS: 'conflictcanvas_tasks',
  CONFLICTS: 'conflictcanvas_conflicts',
  ACTIVITY: 'conflictcanvas_activity'
};
