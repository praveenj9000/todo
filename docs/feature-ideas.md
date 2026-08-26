# Feature Ideas — Product Roadmap Candidates

Ideas discussed for extending the app beyond core task management, captured
for later reference. Not commitments or a prioritized backlog — a running
list to revisit. Each entry notes roughly why it's worth considering and
what it would take.

---

## User-facing features

### Soft delete / trash with undo

**Why:** deletion is currently permanent — a mis-tap on Delete is
unrecoverable. This stands out given how much of this app's architecture
(offline queueing, restart-resumable mutations, optimistic rollback) has
been built around resilience; hard delete is the one place that safety net
doesn't exist.
**Roughly:** add a `deleted_at` column, filter it out of normal queries, add
a "Trash" view, auto-purge after N days.
**Priority read:** highest of the deferred ideas — cheap, low-risk, closes a
real gap.

### Due dates + reminders

**Why:** probably the single most expected feature for a todo app that
isn't already present.
**Roughly:** a due date column alone is cheap and valuable on its own
(overdue-highlighting in the UI). Reminders (local notifications, or push
via Expo notifications) is a bigger lift and can follow separately.

### Tags/labels + real search

**Why:** filtering today is only All/Active/Completed. Becomes more valuable
the more the pagination/virtualization work already built gets exercised by
larger task lists.
**Roughly:** a tags table or array column, plus free-text search over
title (and later, notes/body if that's added).

### Mark a task as a "note"

**Why:** cheap, low-risk extension — some items people track aren't really
actionable tasks.
**Roughly:** a `type` field (`task` | `note`) that changes which UI
affordances show (e.g. a note might hide the completion checkbox while
keeping drag/reorder).

### Recurring tasks

**Why:** high value specifically for a todo app — "every Monday, do X."
**Roughly:** a recurrence rule plus a job/mechanism that generates the next
instance when the current one completes or on schedule.

### Task duration / time estimation

**Why:** cheap addition, and it's the natural input for calendar/time-blocking
and daily-planning views below — worth building alongside those rather than
in isolation.
**Roughly:** an optional estimated-duration field per task.

### Calendar / time blocking

**Why:** a real differentiator once due dates exist — schedule tasks into
actual calendar slots rather than just a flat list with a date attached.
**Roughly:** meaningfully bigger scope than most items here — needs its own
calendar view/UI and drag-to-schedule interaction, not just a new column.
Natural pairing with task duration above and due dates (already listed).

### Daily planning view

**Why:** "what should I actually work on today" — a smart, opinionated view
rather than a new data model. Relatively cheap since it's mostly a filter/
sort over data that already exists (due dates, priority, active tasks).
**Roughly:** a dedicated screen surfacing today's due/overdue/prioritized
tasks, separate from the general list.

### Task history / activity log

**Why:** genuinely close to work already done — `task_links` already tracks
`created_from_task_id` and `created_at`; a general activity table (status
changes, edits, completions over time) is the same shape of thing applied
more broadly.
**Roughly:** a `task_activity` table logging status transitions; a per-task
"history" view reusing UI patterns similar to the linked-tasks panel.

### Projects / lists (single-user)

**Why:** distinct from — and much smaller than — shared team workspaces
(see below). This is just grouping one person's own tasks into named lists
("Work," "Personal," "Someday") — a common, expected organizational feature
with no multi-user/RLS complexity at all.
**Roughly:** a `projects` or `lists` table the user owns, tasks optionally
belong to one; filter/switch between them similar to how filter/sort already
work.

### Natural-language task creation

**Why:** well-scoped, tangible win — "lunch with Sam tomorrow 1pm" parsed
into a title plus a due date on entry, rather than filling separate fields.
Doesn't require the heavier, less-defined AI-assistant features below.
**Roughly:** a parsing step (date/time extraction) on the add-task input
before it's submitted.

### AI-assisted breakdown / planning (exploratory)

**Why:** promising direction (auto-splitting a large task into subtasks,
or an AI-suggested daily plan), but "AI" isn't itself a feature — needs a
concrete UX spec (what exactly gets generated, how it's reviewed/edited
before being applied) before it's actionable. Captured here as a direction
to explore further, not a scoped feature yet.

### Visual map of linked tasks

**Why:** a genuine enhancement to the task-linking feature already built,
but a real UI/rendering project on its own — node/edge graph layout,
zoom/pan, and (notoriously) graphs are hard to make usable on small mobile
screens.
**Roughly:** likely worth scoping as **web-first** given the screen-space
constraints on native; the current flat root-N ancestor list already
conveys hierarchy reasonably well at this app's scale.
**Priority read:** nice-later, not next — meaningfully more effort than
most other items here for a narrower payoff.

---

## Business / growth-oriented features

### Freemium tiers

**Why:** the most common monetization path for a todo app — free tier
capped (task limit, no linking, no reminders), paid tier unlocks
everything.
**Roughly:** the existing `FEATURES` config pattern (pagination/dragSort/
infiniteScroll toggles) is structurally close to what's needed — the
natural evolution is per-user entitlement flags checked at runtime instead
of one static app-wide config.

### OS integration (widgets, Siri Shortcuts, Android quick-add tile)

**Why:** less about a single feature, more about retention — more
touchpoints with a person's day meaningfully increases the odds the app
survives the normal app-graveyard purge cycle. Doesn't need to be
technically impressive to be valuable here.

### Analytics / insights dashboard

**Why:** a classic premium-tier hook in this category (Todoist, Habitica,
etc.) — "completed 40 tasks this week, up 12%," streaks, simple trend
charts. Gives people a reason to open the app even with nothing new to add.
**Roughly:** cheap relative to its value — `created_at`/`completed_at`
already exist on every task row.

### Export / calendar sync

**Why:** makes the app viable as a hub rather than a silo. Many users run
2-3 productivity tools simultaneously; playing well with the others
improves retention.
(Also the natural home for any other third-party integrations — task
managers, note apps, etc. — considered later; treat as one integrations
effort rather than one-off per service.)

**Roughly:** iCal feed to start; two-way Google Calendar sync as a larger
follow-up.

### List sharing (public read-only + per-user permissions) — implemented

**Status: implemented.** Lists (both todo lists and checklists) support
two tiers of sharing:

1. **Public read-only link** — a genuine growth/viral mechanic: someone
   shares a packing list or project checklist via a public link, some
   fraction of viewers sign up. No membership model, no RLS rewrite, just
   a public read-only view behind a generated token.
2. **Share with specific users** — each shared user is granted either
   **read-only** or **editable** rights on the list. Small, fixed set of
   people (family, household, 2-3 collaborators), not a generic team
   workspace — no roles table, no org concept, just a per-user permission
   on a list.

**Implemented schema:** a `share_token` column on `lists` for public links,
plus a `list_shares` table (`list_id`, `subject_type` in (`user`, `group`),
`subject_id`, `permission` in (`read`, `edit`)) for per-user sharing, with
RLS policies extended so a user can read (and, if permitted, write) lists
they're shared on but don't own. Realtime sync extends naturally since the
subscription filter gains an "owner or shared-with-me" clause.

**Access rules:** unauthenticated/logged-out users are always treated as
read-only unless explicit public edit access is enabled on the list. Only
the list owner can manage share settings, grant/revoke access, or delete
the list.

**Future: groups.** This will be extended to support **groups** — a shared
list can later belong to a group (e.g. a family, a household, a small team)
with a single invite granting access to everyone in the group, rather than
inviting each person individually. Groups are a deliberate future
extension; the per-user and public-link model is designed so groups can be
layered on without reworking it.

### Templates

**Why:** prebuilt task sets ("Weekly grocery run," "New employee
onboarding," "Trip packing list") that clone in one tap — helps new users
reach a "wow" moment faster (activation), and could plausibly become a
marketplace angle later (user-generated or paid templates).
**Roughly:** could literally reuse the task-linking tree feature already
built — a template can be a pre-linked tree of tasks, cloned as a unit.

---

## Shared / collaborative lists — reframed from "team workspace"

**Original framing (team workspace) — not recommended as-is.** A generic
shared-task-workspace goes head-to-head with Todoist, Asana, Trello,
Monday, ClickUp, Notion, and Linear — a saturated category with well-funded
incumbents and no clear differentiation story for a todo app entering that
space. It's also the most expensive item considered: a full RLS/membership
model rewrite (every policy is currently `auth.uid() = user_id`,
single-owner), an invite flow, and it reopens the multi-device conflict
resolution question that was deliberately scoped out earlier — except now
between _different people_ editing the same task, which has a real chance
of actually colliding, not just a low-probability same-user edge case.

**Better framing: shared lists between a small, fixed set of people** — not
a generic team workspace. Aimed at a different, less saturated niche:
household/family shared todos (groceries, chores, "who's picking up the
kids") or tight ad-hoc collaboration (2-3 people planning a trip). The big
project-management players are built for work teams, not this; it's a
genuine gap rather than a crowded fight.

**Natural follow-ons once shared lists exist** (not separate efforts):
task assignment to a specific collaborator, comments/discussion on a task,
and lightweight shared-list analytics ("who's completed what"). None of
these are meaningful on their own without shared lists existing first.

**Explicitly out of scope even if shared lists happen:** SSO, audit logs,
and admin/org management — that's enterprise-buyer territory, a different
product and sales motion entirely from a personal/family/small-group todo
app. Only reconsider if deliberately pursuing an enterprise strategy, which
is a business decision, not a natural extension of this feature.

**Why this framing is meaningfully smaller in scope:** no roles or admin
console, no organization concept — a list has a small, specific set of
collaborators, not an org with permissions tiers. Mechanically an extension
of the shareable-link idea above (read-only → read-write for specifically
invited people), rather than a from-scratch "workspace" architecture.

**Status:** interesting, not scoped or started. If pursued, treat as its
own deliberate project phase — likely comparable in size to the
offline+realtime work already done in this repo, possibly larger once
conflict resolution between different people is actually addressed (not
deferred, the way it was for single-user multi-device).

---

## Manager-assigned tasks with completion notifications

**Distinct from the "shared lists" idea above — different relationship
shape.** Shared lists assume roughly equal visibility among a small group
(everyone sees the same list). This is asymmetric instead: one person
(manager) assigns a task to another (assignee), and gets notified when it's
done. Closer to lightweight delegation than to shared ownership.

**Why this is a stronger business angle than generic "team workspace":** it
targets a real gap rather than a crowded fight. The big project-management
tools (Asana, Trello, Monday) are built for teams that need the full
apparatus — boards, roles, permissions — which is overkill for a parent
assigning chores to kids, a small business owner delegating a handful of
tasks to a couple of employees, or a team lead handing off a short list of
action items. Those users are underserved by tools built for larger,
heavier organizational use. It's also a clean, easy-to-explain paid-tier
anchor: free tier stays personal-use-only, paid tier unlocks "assign to
others and get notified."

**What it actually requires (real scope, not a small add):**

- **A minimal ownership/assignment model** — today every RLS policy is
  `auth.uid() = user_id`, strictly single-owner. This needs at minimum an
  `assignee_id` distinct from the task's owner/creator, plus RLS policies
  letting an assignee see and update only their assigned tasks (not the
  manager's whole list), and letting a manager see tasks they've assigned
  without owning them outright. Smaller than a full membership/workspace
  model — no roles table, no org concept, just one assignment relationship
  between two specific people — but still a genuine RLS redesign, not a
  column add.
- **Some way for a manager and an assignee to be connected** — the lighter
  option (and the one worth trying first) is a simple accepted-invite
  connection between two accounts, with no "workspace" entity at all: you
  can assign a task to anyone who's accepted your invite. Avoids
  reintroducing the heavier workspace/org model this framing was meant to
  avoid.
- **Notifications** — "gets notified on completion" needs real delivery.
  In-app notification is relatively cheap given the Realtime infrastructure
  already built in this repo — a manager's client could subscribe to
  completion events on tasks they've assigned out, close to "for free"
  architecturally. Push or email notification is a meaningfully bigger lift
  (Expo push tokens, a notification service, deliverability) and should be
  treated as a separate follow-up, not bundled into a first version.
- **A narrower version of the conflict-resolution question** — not the
  general multi-party problem flagged as out of scope elsewhere, but a
  bounded one: what happens if an assignee marks a task complete right as
  the manager reassigns or edits it. Worth a real answer, but scoped to two
  specific people on one task, not a whole team.

**Priority read:** the strongest business-value candidate in this whole
shared/collaborative section — narrower and more defensible than generic
team workspace, with a clear monetization story and a real underserved
niche. Still a genuine project on its own (RLS redesign + connection model

- notifications), not a quick add — but worth prioritizing over the flat
  shared-lists idea if choosing between the two.

**Status:** interesting, not scoped or started.

### Checklists (separate feature, not inside a task)

**Why:** a genuinely different usage pattern from tasks, not just a
renamed list. A checklist ("things to check before leaving for
vacation": tickets, camera, charge phone) is typically created as a
batch, worked through in one sitting, and then reset or archived —
unlike tasks, which accumulate and persist with due dates/priority/
linking. Distinct from the earlier "Subtasks" idea (checklist items
nested inside one task) and from "Projects/lists" (user-named
groupings of ordinary tasks) — this is its own top-level feature with
its own object model and its own tab/section in the app.

**Roughly:**

- A `checklists` table (name, created_at) and a `checklist_items` table
  (checklist_id, title, checked, sort_order) — deliberately not reusing
  the `tasks` table, since checklist items don't need due dates,
  filters, linking, or most of what `tasks` carries.
- A "reset" action per checklist: uncheck every item without deleting
  them, so a recurring checklist (e.g. "Pre-flight checklist") can be
  reused trip after trip instead of recreated from scratch each time.
- Reuses existing `@todo/ui` primitives (`List`/`SortableList`) for
  rendering and reordering items — no new list-rendering work needed,
  same pattern the tasks feature already uses.
- A new tab/section in navigation, separate from the tasks screen.

**Priority read:** cheap relative to its value — most of the underlying
list/reorder infrastructure already exists and is reusable as-is; the
new work is mostly the checklist/checklist_items schema, a reset
action, and a new screen wiring existing components together. A good
candidate for "next feature built," comparable in scope to soft
delete or due dates.

**Status:** not started.
