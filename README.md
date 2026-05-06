# TaskForge 🔧

A team task manager I built as a college project. Nothing fancy — just something that actually works for managing tasks across a small team.

## Why I Built This

Honestly, we were using a WhatsApp group to track project tasks and it was a mess. People would forget what they were assigned, miss deadlines, and no one knew what was done vs what wasn't. I figured building something simple would be a good way to learn full-stack and actually solve a real problem at the same time.

## Features

- **Login & Register** — JWT-based auth, sessions stay alive for 7 days
- **Role-based access** — First user to register is automatically Admin. Everyone else is a Member.
  - Admin: can create projects, add members, create tasks, assign tasks to anyone
  - Member: can only update the status of tasks assigned to them
- **Projects** — Create projects, add team members
- **Tasks** — Kanban-style board (Todo / In Progress / Done) per project
- **Overdue highlighting** — Tasks past due date turn red. Hard to miss.
- **Dashboard** — Quick overview: total tasks, completed, overdue, assigned to you

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB (Atlas)
- **Auth**: JWT stored in localStorage

## Project Structure

```
taskforge/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── components/Layout.jsx
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Projects.jsx
    │   │   ├── ProjectDetail.jsx
    │   │   └── Tasks.jsx
    │   ├── utils/api.js
    │   ├── App.jsx
    │   └── index.js
    ├── tailwind.config.js
    ├── .env.example
    └── package.json
```

## Setup Instructions

### 1. MongoDB Atlas (Free)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a free cluster (M0 tier)
3. Under **Database Access**, create a user with a password
4. Under **Network Access**, add `0.0.0.0/0` (allow from anywhere) — fine for dev/small projects
5. Click **Connect** → **Drivers** → copy the connection string
6. It looks like: `mongodb+srv://yourUser:yourPass@cluster0.xxxxx.mongodb.net/`
7. Add `/taskforge` at the end before the `?` — that's your database name

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and paste your MongoDB URI + set a JWT secret
npm run dev
```

Your `.env` file should look like:
```
PORT=5000
MONGO_URI=mongodb+srv://yourUser:yourPass@cluster0.xxxxx.mongodb.net/taskforge?retryWrites=true&w=majority
JWT_SECRET=pick_something_long_and_random_like_this_abc123xyz
CLIENT_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# .env just needs:
# REACT_APP_API_URL=http://localhost:5000/api
npm start
```

---

## Deployment

### Backend → Render (free tier)

1. Push your backend folder to GitHub (can be its own repo or a subfolder)
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Root Directory**: `backend` (if it's in a monorepo)
5. Add environment variables in the Render dashboard (same as your .env)
6. Deploy — Render gives you a URL like `https://taskforge-api.onrender.com`

> ⚠️ Free tier spins down after 15 min of inactivity. First request after sleep takes ~30 seconds. Totally fine for demo purposes.

### Frontend → Vercel

1. Push your frontend folder to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import
3. Add environment variable:
   - `REACT_APP_API_URL` = your Render backend URL + `/api`
   - e.g. `https://taskforge-api.onrender.com/api`
4. Deploy — Vercel handles the build automatically

---

## Challenges I Ran Into

**1. CORS errors when frontend and backend are on different domains**
Spent like 2 hours on this. Fixed it by properly configuring the CORS middleware with `credentials: true` and the exact frontend origin.

**2. JWT expiry not handled on the frontend**
Initially the app would just break silently when the token expired. Added an Axios interceptor that automatically redirects to login on a 401 response.

**3. Role-based access was trickier than expected**
The tricky part wasn't the logic — it was deciding *where* to enforce it. I ended up doing it both in the backend routes (the real security) and on the frontend (hide buttons for members). The backend check is what actually matters.

**4. Overdue detection across timezones**
JavaScript `Date` comparison works on UTC, but displayed dates are local. Something to be aware of if your team is in different timezones.

**5. MongoDB Atlas free tier IP whitelist**
Forgot to whitelist `0.0.0.0/0` when deploying to Render. Took a while to figure out why the DB connection was failing in production but not locally.

---

## Future Improvements

- [ ] Email notifications when a task is assigned to you
- [ ] File attachments on tasks
- [ ] Activity log / history per task
- [ ] Admin can promote/demote users instead of just first-user-is-admin
- [ ] Dark mode (Tailwind makes this easy, just haven't done it)
- [ ] Better mobile layout

---

## License

MIT — use it however you want.
