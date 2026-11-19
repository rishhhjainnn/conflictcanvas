# ConflictCanvas

> **Real-time collaborative workspace that prevents accidental data loss during simultaneous edits.**

## 1. Overview

**ConflictCanvas** is a real-time collaboration platform for remote teams to manage projects, tasks, comments, files, deadlines, and progress from one workspace.

The main innovation is an **intelligent conflict-resolution system** that detects when two users modify the same task at nearly the same time and prevents one user's work from being silently overwritten.

---

## 2. Problem

Remote teams often use disconnected tools for project management, communication, and file sharing.

The major problem is **simultaneous editing**.

Example:

* User A changes a task status to `Completed`.
* User B changes the same task status to `In Review`.
* Both users were working on the same task version.
* The system must detect the conflict instead of simply using the last update.

---

## 3. Goals

ConflictCanvas should:

* Provide one workspace for remote teams.
* Support project and task management.
* Provide real-time updates.
* Allow comments and file sharing.
* Track deadlines and project progress.
* Show team online presence.
* Detect simultaneous task modifications.
* Automatically merge safe/non-conflicting changes.
* Let users manually resolve genuine conflicts.
* Never silently overwrite a user's work.

---

# 4. Core Features

## Project Management

* Create, edit and delete projects.
* Add/remove team members.
* Set project description and deadline.
* Track overall project progress.

## Task Management

* Create, edit and delete tasks.
* Assign tasks to team members.
* Set status, priority and deadline.
* Kanban-style task board.

### Task Status

`TODO` → `IN_PROGRESS` → `IN_REVIEW` → `DONE`

Additional status:

`BLOCKED`

### Priority

`LOW` | `MEDIUM` | `HIGH` | `CRITICAL`

---

## Real-Time Collaboration

Use WebSockets to provide:

* Real-time task updates.
* Real-time comments.
* Task assignment updates.
* Status changes.
* File upload notifications.
* Project updates.
* Conflict notifications.
* Online/offline presence.

Users should not need to refresh the page to see changes.

---

## Comments

Users can:

* Add comments to tasks.
* Edit their comments.
* Delete their comments.
* See new comments in real time.

---

## File Sharing

Users can upload and access project/task files.

Supported examples:

* PDF
* DOC/DOCX
* PNG/JPG
* ZIP
* Source-code files

Store files separately from the main database using cloud/object storage.

---

## Deadlines & Progress

Each task should have:

* Start date
* Deadline
* Status
* Priority

Show simple indicators:

* 🟢 On Track
* 🟡 Due Soon
* 🔴 Overdue

Project progress should be calculated from completed tasks.

---

# 5. Main Innovation — Conflict Resolution

Every task has a `version`.

Example:

```text
Task ID: 101
Version: 7
```

When a user opens the task, the client remembers:

```text
baseVersion = 7
```

### Successful update

If:

```text
client baseVersion == server version
```

the server accepts the update and increments the version.

```text
Version 7 → Version 8
```

### Conflict

If:

```text
client baseVersion != server version
```

another user has already modified the task.

The backend must NOT blindly overwrite the existing data.

---

## Smart Merge

If users modify different fields:

```text
User A:
status = DONE

User B:
priority = CRITICAL
```

The system can safely merge:

```text
status = DONE
priority = CRITICAL
```

and create a new version.

---

## Real Conflict

If both users modify the same field:

```text
User A:
status = DONE

User B:
status = IN_REVIEW
```

show a conflict-resolution interface:

```text
CONFLICT DETECTED

Your change:
Status → IN_REVIEW

Latest server change:
Status → DONE

[ Keep Mine ]
[ Keep Latest ]
[ Compare / Merge ]
```

The final decision must be stored in the conflict history.

---

# 6. Conflict Data

A conflict should store:

```text
conflict_id
task_id
user_id
base_version
server_version
client_changes
server_changes
status
resolution
resolved_by
created_at
resolved_at
```

Conflict status:

`OPEN` | `RESOLVED`

---

# 7. Dashboard

The main dashboard should show:

* Total projects
* Total tasks
* Completed tasks
* Active tasks
* Blocked tasks
* Overdue tasks
* Open conflicts
* Overall project progress
* Recent activity
* Online team members

Example:

```text
Projects     Tasks     Completed     Conflicts
   06          42          28             02
```

---

# 8. Activity Timeline

Track important project events:

```text
Rishi created Login API
Aashish was assigned to Login API
Nitya added a comment
Rishi changed priority to HIGH
Aashish uploaded API.pdf
Conflict detected
Conflict resolved
```

---

# 9. Recommended Pages

```text
/login
/dashboard
/projects
/projects/:id
/tasks/:id
/conflicts
/activity
/profile
```

The exact routing structure can be adapted to the chosen frontend architecture.

---

# 10. Technical Stack

## Frontend

Preferred:

* HTML5
* CSS3
* JavaScript ES6+

Optional UI libraries:

* Three.js — 3D visual elements only where useful.
* GSAP — animations.
* Chart.js — dashboard charts.
* Lucide Icons — icons.

> Core functionality must not depend on 3D effects or animations.

## Backend

* Python
* FastAPI
* REST API
* WebSockets
* JWT authentication
* Pydantic validation

## Database

* PostgreSQL

Recommended hosted option:

* Supabase PostgreSQL

## File Storage

* Supabase Storage or compatible object storage.

## Development Tools

* Git
* GitHub
* VS Code
* Postman/Insomnia
* Browser DevTools

## Deployment

Frontend:

* Vercel or equivalent

Backend:

* Render / Railway / equivalent

Database:

* Supabase PostgreSQL or managed PostgreSQL

---

# 11. High-Level Architecture

```text
                  ConflictCanvas
                        |
          +-------------+-------------+
          |                           |
       Frontend                    Backend
   HTML/CSS/JavaScript              FastAPI
          |                           |
          |                     +-----+-----+
          |                     |           |
       REST API             REST API    WebSocket
          |                     |           |
          +---------------------+-----------+
                                |
                           PostgreSQL
                                |
                         File Storage
```

---

# 12. Real-Time Flow

```text
User A
  |
  | Update Task
  v
Frontend
  |
  | WebSocket / API
  v
FastAPI
  |
  | Validate version
  v
PostgreSQL
  |
  | Broadcast update
  v
WebSocket
  |
  +------> User B
  |
  +------> User C
```

---

# 13. Conflict Flow

```text
User A + User B
       |
       v
Same Task Version
       |
       v
Both make changes
       |
       v
First update accepted
       |
       v
Task version increases
       |
       v
Second update arrives
       |
       v
Version mismatch
       |
       v
Conflict Detection
       |
   +---+---+
   |       |
   v       v
Different Same Field
Fields   Changed
   |       |
   v       v
Auto     Conflict UI
Merge       |
           v
      User Resolution
```

---

# 14. API Structure

### Authentication

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Projects

```text
GET    /projects
POST   /projects
GET    /projects/{id}
PUT    /projects/{id}
DELETE /projects/{id}
```

### Tasks

```text
GET    /projects/{id}/tasks
POST   /tasks
GET    /tasks/{id}
PUT    /tasks/{id}
DELETE /tasks/{id}
```

### Comments

```text
GET  /tasks/{id}/comments
POST /tasks/{id}/comments
```

### Conflicts

```text
GET  /conflicts
GET  /conflicts/{id}
POST /conflicts/{id}/resolve
```

### WebSocket

```text
/ws/projects/{project_id}
```

---

# 15. Suggested Database Tables

```text
users
projects
project_members
tasks
comments
attachments
activity_logs
conflicts
```

### Important Task Fields

```text
id
project_id
title
description
assigned_to
status
priority
deadline
version
created_by
updated_by
created_at
updated_at
```

The `version` field is essential for conflict detection.

---

# 16. UI/UX Direction

Design should be:

* Modern
* Professional
* Responsive
* Developer-friendly
* Clean and easy to understand
* Suitable for desktop and mobile

Suggested visual style:

* Dark/light theme
* Clean cards
* Kanban board
* Clear status indicators
* Real-time presence indicators
* Visual conflict comparison
* Subtle animations

The interface should prioritize **usability over excessive visual effects**.

---

# 17. MVP Scope

### Phase 1 — Foundation

* Authentication
* PostgreSQL setup
* Project creation
* Task CRUD

### Phase 2 — Collaboration

* Task assignment
* Kanban board
* Comments
* Dashboard
* File uploads

### Phase 3 — Real-Time

* WebSocket connection
* Real-time task updates
* Real-time comments
* Online presence

### Phase 4 — Innovation

* Task versioning
* Conflict detection
* Smart field-level merge
* Conflict comparison
* Conflict resolution
* Conflict history

### Phase 5 — Polish

* Responsive UI
* Notifications
* Activity timeline
* Dashboard improvements
* Deployment

---

# 18. Demo Scenario

The main hackathon demo should demonstrate the innovation.

1. Open the same task in two browser windows.
2. Both clients have `Version 7`.
3. User A changes `Status → DONE`.
4. User B changes `Status → IN_REVIEW`.
5. User A's update is accepted.
6. Server becomes `Version 8`.
7. User B sends an update based on `Version 7`.
8. Backend detects the version mismatch.
9. Conflict UI appears.
10. Show both versions.
11. User selects a resolution.
12. Final state is synchronized to all connected users.

Also demonstrate a safe merge:

```text
User A → Status = DONE
User B → Priority = CRITICAL

Result:
Status = DONE
Priority = CRITICAL
```

---

# 19. Success Criteria

The project is considered complete when:

* Users can create projects.
* Users can create and assign tasks.
* Task status and priority can be managed.
* Comments work.
* Files can be uploaded.
* Deadlines and progress are visible.
* Multiple users receive real-time updates.
* Online presence is visible.
* Simultaneous edits are detected.
* Non-conflicting changes can be merged.
* Genuine conflicts are shown clearly.
* Users can resolve conflicts.
* No update is silently overwritten.

---

# 20. Future Scope

Possible future improvements:

* AI project assistant
* AI-generated project summaries
* AI handoff summaries
* Risk prediction
* GitHub integration
* Slack/Teams integration
* Calendar integration
* Voice commands
* Offline support

These features should be added only after the core collaboration and conflict-resolution system is stable.

---

# 21. Core USP

> **ConflictCanvas is a real-time collaborative workspace that doesn't simply show the latest update. It understands when multiple users modify the same task, automatically merges safe changes, and gives users control when a genuine conflict occurs.**

### Key Differentiator

**Real-Time Collaboration + Intelligent Conflict Resolution + No Silent Data Loss**
