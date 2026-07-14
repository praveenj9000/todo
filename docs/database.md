# Database Design

## Database

PostgreSQL

Hosted using Supabase.

---

# Current Status

Database implementation has not started.

This document describes the intended design.

---

# Tables

## profiles

Purpose:

Stores user profile information.

Columns:

- id
- email
- display_name
- avatar_url
- created_at
- updated_at

---

## tasks

Purpose:

Stores Todo items.

Columns:

- id
- user_id
- title
- description
- completed
- created_at
- updated_at
- completed_at

---

# Relationships

profiles

1

↓

Many

tasks

---

# Row Level Security

Every user should only access their own tasks.

Policies:

SELECT

User can read only their own tasks.

INSERT

User can create only their own tasks.

UPDATE

User can update only their own tasks.

DELETE

User can delete only their own tasks.

---

# Indexes (Planned)

tasks(user_id)

tasks(completed)

tasks(updated_at)

---

# Synchronization

Supabase Realtime

↓

TanStack Query

↓

Local Cache

↓

UI

---

# Offline Strategy

Planned:

- Local persistence
- Synchronization queue
- Conflict detection
- Retry mechanism

---

# Future Tables

Potential additions:

- labels
- task_labels
- reminders
- attachments
- shared_tasks
- activity_log

These will only be added when required.