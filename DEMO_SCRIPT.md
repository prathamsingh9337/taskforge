# TaskForge — Demo Script (2–3 min)

---

**[0:00 — Intro / Problem]**

"So the reason I built this is pretty simple — our college project group was managing tasks over WhatsApp, and it was a mess. Nobody knew who was doing what, things were getting missed, and there was no way to see what's actually done versus what's still pending.

So I built TaskForge — a team task manager that handles all of that."

---

**[0:20 — Quick overview]**

"It's a full-stack web app. React on the frontend, Node and Express on the backend, MongoDB for the database, and JWT for authentication.

There are two roles — Admin and Member. Admin controls everything, members can only update their own tasks."

---

**[0:35 — Demo: Register + Login]**

"Let me show you how it works. I'll register as admin first — the first user to sign up automatically gets admin role, which I thought was a clean way to handle it without needing a separate setup step.

[Register → Login → lands on Dashboard]

This is the dashboard. You can see total tasks, how many are completed, how many are overdue, and how many are assigned to me specifically."

---

**[1:00 — Demo: Create Project]**

"Let me create a project. I'll call it 'Website Redesign'.

[Create project modal → add description → add members]

I can add members here — any registered users show up in this list. Members can only see projects they've been added to, they can't see everything."

---

**[1:20 — Demo: Add Tasks]**

"Now I'll add some tasks to this project.

[Open project → click Add Task]

I'll create a task, assign it to one of the team members, set a due date, and mark it as high priority.

[Create task → it appears in the Todo column]

The board has three columns — Todo, In Progress, and Done. Each task shows who it's assigned to, when it's due, and the priority level."

---

**[1:45 — Demo: Overdue + Member view]**

"Let me show you the overdue highlighting. If a task's due date has passed and it's not done yet, it turns red like this — pretty hard to miss.

[Show overdue task in red]

Now if I log in as a regular member... I can see the projects I'm part of, I can see my tasks on the dashboard, but I can't create projects or tasks. I can only update the status of tasks assigned to me.

[Change status from todo to in-progress using the dropdown]

That's the role-based access working."

---

**[2:15 — Wrap up]**

"So to summarize — TaskForge handles user auth with roles, project and task management, and gives you a clean view of what's overdue and what's assigned to you.

The backend is deployed on Render, the frontend is on Vercel, and the database is on MongoDB Atlas — all free tiers.

The code is on GitHub if you want to check it out. Thanks."

---

**Tips for recording:**
- Have two browser windows open side by side — one logged in as admin, one as member
- Pre-create one overdue task before recording so the red highlighting is visible immediately
- Keep it moving — don't stay on any one screen for more than 20-30 seconds
