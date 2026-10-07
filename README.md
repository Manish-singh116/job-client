# Job Application Tracker

A full-stack app to track job applications: log in, add jobs, update their status, and search or filter them.

**Live demo:** https://job-client-black.vercel.app
**API:** https://job-api-zeek.onrender.com

> The backend runs on a free plan and sleeps when idle. The first request can take up to a minute.

## Features
- Register and log in with JWT authentication
- Passwords hashed with bcrypt
- Each user sees only their own jobs
- Add, edit status, and delete applications
- Search by company or role, and filter by status
- Status counts at a glance
- Input validation and clear error messages

## Tech stack
- **Frontend:** React (Vite), deployed on Vercel
- **Backend:** Node.js, Express, deployed on Render
- **Database:** MongoDB Atlas with Mongoose
- **Auth:** JSON Web Tokens, bcryptjs

## API endpoints
| Method | Path | Description |
|---|---|---|
| POST | /api/auth/register | Create an account |
| POST | /api/auth/login | Log in and get a token |
| GET | /api/jobs | List my jobs (token required) |
| POST | /api/jobs | Add a job |
| PUT | /api/jobs/:id | Update a job |
| DELETE | /api/jobs/:id | Delete a job |

## Run locally
```bash
git clone https://github.com/Manish-singh116/job-client.git
cd job-client
npm install
npm run dev
```
Backend repo: https://github.com/Manish-singh116/job-api
