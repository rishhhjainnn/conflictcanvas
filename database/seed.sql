-- ConflictCanvas Seed Data
-- Seed Users, Project, Tasks, and Activities for Rishi Jain

-- 1. Insert Initial Users
INSERT INTO users (id, email, name, hashed_password, avatar, is_active, is_online)
VALUES 
    (1, 'rishi@demo.com', 'Rishi', '$2b$12$KIXe8tU9u15tqS6z7m3jCee7eIeI56T3uC9pWb2v1yGgO3jM8e6e', 'R', true, true),
    (2, 'vansh@demo.com', 'Vansh', '$2b$12$KIXe8tU9u15tqS6z7m3jCee7eIeI56T3uC9pWb2v1yGgO3jM8e6e', 'V', true, true),
    (3, 'nitya@demo.com', 'Nitya', '$2b$12$KIXe8tU9u15tqS6z7m3jCee7eIeI56T3uC9pWb2v1yGgO3jM8e6e', 'N', true, false),
    (4, 'aashish@demo.com', 'Aashish', '$2b$12$KIXe8tU9u15tqS6z7m3jCee7eIeI56T3uC9pWb2v1yGgO3jM8e6e', 'A', true, true);

-- 2. Insert Main Collaboration Project
INSERT INTO projects (id, name, description, status, priority, progress, deadline, created_by)
VALUES (
    1,
    'ConflictCanvas Platform',
    'Real-time collaborative workspace with intelligent conflict resolution developed by Rishi Jain',
    'active',
    'high',
    75,
    '2026-12-31 23:59:59+00',
    1
);

-- 3. Project Members
INSERT INTO project_members (project_id, user_id, role)
VALUES 
    (1, 1, 'admin'),
    (1, 2, 'member'),
    (1, 3, 'member'),
    (1, 4, 'member');

-- 4. Initial Tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, assigned_to, version, created_by, updated_by)
VALUES 
    (1, 1, 'Authentication API', 'Implement JWT-based authentication system with refresh tokens', 'in_review', 'high', 1, 7, 1, 2),
    (2, 1, 'Dashboard UI', 'Create responsive dashboard with real-time statistics and 3D canvas', 'in_progress', 'high', 2, 4, 1, 2),
    (3, 1, 'WebSocket Engine', 'Set up bi-directional messaging pipeline for live document edits', 'done', 'critical', 1, 12, 1, 1),
    (4, 1, 'Conflict Resolver Logic', 'Smart field-level merge algorithm for simultaneous edits', 'in_progress', 'critical', 2, 5, 2, 1);

-- 5. Comments
INSERT INTO comments (id, task_id, user_id, content)
VALUES
    (1, 1, 2, 'Added support for RS256 token rotation. Please review!'),
    (2, 1, 1, 'Looks good Vansh, let us run integration tests on the auth endpoints.');

-- 6. Initial Activity Logs
INSERT INTO activity_logs (id, project_id, task_id, user_id, action, entity_type, entity_id, details)
VALUES
    (1, 1, 1, 1, 'task_created', 'task', 1, '{"title": "Authentication API"}'),
    (2, 1, 1, 2, 'status_changed', 'task', 1, '{"from": "in_progress", "to": "in_review"}'),
    (3, 1, 2, 2, 'priority_changed', 'task', 2, '{"priority": "high"}');
