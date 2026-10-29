# RemoteHire: Job Board & Remote Career Portal

A full-stack job board with three role-based dashboards. Employers post jobs, admins moderate them, and job seekers search, filter and apply. Built with Next.js, TypeScript, Prisma and PostgreSQL.

**Live demo:** https://remotehire-chi.vercel.app
**Code:** https://github.com/Laybashahzadi39/remotehire

## Features

**Job seekers**
- Sign up, log in and browse approved jobs
- Search by keyword, filter by work mode (Remote, Hybrid, On-site) and job type, with pagination
- Profile with headline, skills and summary
- Private PDF resume upload and an optional cover note on every application
- Track each application: Pending, Reviewed, Interview, Rejected
- Report a suspicious job

**Employers**
- Post, edit, close and reopen jobs
- View applicants with profile, cover note and resume, and update their status
- Trusted employer system: after one approved job, new jobs publish instantly

**Admins**
- Approve or reject new jobs
- Review reported jobs: take them down or dismiss the reports
- Block and unblock users (blocked users lose access immediately)
- Platform overview: users, active jobs, applications and open reports

## How it works

```
Employer posts a job        -> PENDING (new employer) or LIVE (trusted employer)
Scam screening              -> money requests are blocked, off-platform contacts go to review
Admin approves              -> LIVE, and the employer becomes trusted
Seeker applies              -> application PENDING (resume required)
Employer reviews            -> REVIEWED / INTERVIEW / REJECTED
Two reports on a job        -> job is hidden until an admin decides
```

## Key concepts and logic

### Authentication and sessions
- Passwords are hashed with **bcrypt**.
- Login creates a signed **JWT** (`jose`, 7 day expiry) stored in an **httpOnly cookie**.
- On every request the session is verified and the user is checked in the database, so a blocked user is locked out immediately even with an old cookie.
- Login errors are generic ("Invalid email or password") so emails cannot be guessed.
- Admin accounts cannot be created through signup.

### Authorization
- A `requireRole()` helper protects every dashboard page **and** every Server Action, so access is enforced on the server.
- Ownership checks: employers can only see applicants and change statuses for their own jobs.

### Moderation and trust
- Job statuses: `PENDING`, `LIVE`, `CLOSED`, `REJECTED`, `HIDDEN`. Public pages only show `LIVE` jobs.
- **Scam screening:** jobs that ask applicants for money are blocked at posting time. Jobs with WhatsApp, Telegram, emails or phone numbers go to admin review, even for trusted employers.
- **Trusted employers:** one approved job makes an employer trusted, which removes the admin bottleneck for later jobs.
- **Reports:** one report per user per job (database constraint). Two open reports hide the job automatically (demo threshold), and an admin makes the final decision.

### Resume privacy
- Resumes are validated (PDF signature check, max 1 MB) and stored in the database, not in a public folder.
- They are served only through a protected route that allows the seeker or an employer who received that seeker's application, with `Cache-Control: private, no-store`.

### Search, filters and pagination
- Filters live in the URL (`/jobs?q=react&mode=REMOTE&type=FULL_TIME&page=2`), so results are shareable.
- Values from the URL are checked against allowed lists before they reach the database.
- Pagination uses `skip` and `take` with a total count.

### Next.js concepts used
- **App Router**, dynamic routes (`/jobs/[id]`), and **Route Handlers** (`/api/resume/[userId]`)
- **Server Components** for data fetching and **Client Components** only for interactive forms
- **Server Actions** with `useActionState` instead of a separate REST API
- **Cache Components** with **Suspense**: static shells prerender while session and database content streams in
- `revalidatePath` to refresh data after changes

### Validation
Every form is validated on the server with **Zod**.

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js (App Router, Server Actions) |
| Language | TypeScript |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | `jose` (JWT cookies) and `bcryptjs` |
| Validation | Zod |
| Styling | Tailwind CSS |
| Deployment | Vercel |

## Project structure

```
app/            Pages and routes (jobs, dashboards, login, signup, resume API)
actions/        Server Actions: auth, jobs, applications, profile, reports, admin
components/     Reusable UI (Navbar, forms, badges)
lib/            Database client, session handling, role checks, scam screening
prisma/         Schema, migrations and seed script
```

## Database design

`User`, `Profile`, `Job`, `Application` and `Report`.
- A user (employer) has many jobs; a job has many applications and reports
- A user (seeker) has one profile and many applications
- `@@unique([jobId, seekerId])` allows one application per job
- `@@unique([jobId, reporterId])` allows one report per user per job

## Run locally

```bash
git clone https://github.com/Laybashahzadi39/remotehire.git
cd remotehire
npm install
```

Create a `.env` file:

```
DATABASE_URL="your-postgresql-connection-string"
SESSION_SECRET="a-long-random-string"
```

Then:

```bash
npx prisma migrate dev
npm run seed      # creates demo accounts and jobs (this wipes existing data)
npm run dev
```

Open http://localhost:3000

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@test.com | Admin@123 |
| Employer | employer@test.com | Employer@123 |
| Seeker | seeker@test.com | Seeker@123 |
| Seeker | seeker2@test.com | Seeker@123 |

Company names, salaries and jobs are sample data.

## Future improvements

- Store resumes in object storage (S3 or Vercel Blob) with signed URLs
- Email verification and password reset
- Rate limiting on login and apply
- Notifications when an application status changes
- Withdraw applications, saved jobs and job expiry
- Company profile pages