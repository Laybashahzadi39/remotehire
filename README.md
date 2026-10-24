# RemoteHire: Job Board & Remote Career Portal

A full-stack job board where employers post jobs, admins approve them, and job seekers search and apply. Built with Next.js, TypeScript, Prisma and PostgreSQL.

**Live demo:** [your-vercel-link]

![Home page](./screenshots/home.png)

## Features

**Job seekers**
- Sign up, log in and browse approved jobs
- Search jobs by title, company or keyword
- Apply to a job (duplicate applications are blocked)
- Track every application status: Pending, Reviewed, Interview, Rejected

**Employers**
- Post new jobs (sent to admin for approval)
- Manage their own listings and see each job's status
- View applicants for each job and update their status

**Admins**
- Approve or reject new jobs before they go live
- Platform overview: users, active jobs and applications
- View all registered users

**Platform**
- Role-based access control (Seeker, Employer, Admin) enforced on the server
- Secure authentication with hashed passwords and signed cookie sessions
- Input validation on every form

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | Cookie sessions with `jose` (JWT) and `bcryptjs` |
| Validation | Zod |
| Styling | Tailwind CSS |
| Deployment | Vercel |

## How it works

```
Employer posts a job      -> status: PENDING
Admin approves the job    -> status: LIVE
Seeker finds and applies  -> application: PENDING
Employer reviews          -> application: REVIEWED / INTERVIEW / REJECTED
Seeker tracks the result  -> My applications
```

## Key concepts and logic

### Authentication and sessions
- Passwords are hashed with **bcrypt** and never stored in plain text.
- After login, the server creates a signed **JWT** (using `jose`, HS256, 7 day expiry) and stores it in an **httpOnly cookie**, so client-side JavaScript cannot read it.
- Login failures return one generic message ("Invalid email or password") so attackers cannot find out which emails are registered.
- The Admin role cannot be created through signup. The signup schema only accepts `SEEKER` or `EMPLOYER`.

### Role-based access control (RBAC)
- A `requireRole()` helper checks the session on every protected page and **again inside every Server Action**, so access is enforced on the server, not only by hiding buttons.
- Ownership checks: an employer can only view applicants and change statuses for **their own** jobs (queries filter by `employerId`).

### Job lifecycle
```
PENDING  ->  LIVE  or  CLOSED      (admin approves or rejects)
```
Public pages only query `status: "LIVE"`, so unapproved jobs are never visible to seekers. This stops spam listings.

### Application pipeline
```
PENDING  ->  REVIEWED  ->  INTERVIEW  /  REJECTED
```
- Applying twice is blocked at two levels: an application check in code and a database `@@unique([jobId, seekerId])` constraint.
- The new status is validated with Zod before it is saved.

### Database (Prisma + PostgreSQL)
- Three models with relations: `User` 1-to-many `Job`, `Job` 1-to-many `Application`, `User` 1-to-many `Application`.
- Enums (`Role`, `JobStatus`, `AppStatus`) keep data values valid.
- Queries use `include` to join related data, `_count` for applicant totals, and `select` so password hashes are never loaded for lists.
- The admin dashboard runs its queries in parallel with `Promise.all`.
- A seed script creates demo accounts and sample jobs with one command.

### Next.js concepts used
- **App Router** with file-based routing and **dynamic routes** (`/jobs/[id]`).
- **Server Components** fetch data directly from the database; **Client Components** are used only for forms that need state.
- **Server Actions** replace a separate REST API for signup, login, posting jobs, applying and updating statuses.
- `useActionState` shows server-side validation errors and a pending state in forms.
- **Cache Components** and **Suspense**: static page shells are prerendered while session and database content streams in.
- `revalidatePath` refreshes data after a mutation.
- Search uses URL query strings (`/jobs?q=react`) and a case-insensitive `contains` query across title, company and description.

### Validation
All forms are validated on the server with **Zod** (types, lengths, allowed values), and the first error message is shown to the user.

## Project structure

```
app/            Pages and routes (jobs, dashboards, login, signup)
actions/        Server Actions: auth, jobs, applications, admin
components/     Reusable UI (Navbar, JobForm, StatusBadge, CompanyAvatar)
lib/            Database client, session handling, role checks
prisma/         Database schema, migrations and seed script
```

## Database design

Three tables: `User`, `Job` and `Application`.
- A user (employer) has many jobs
- A job has many applications
- A user (seeker) has many applications
- `@@unique([jobId, seekerId])` ensures a seeker can apply only once per job

## Run locally

```bash
git clone [your-repo-link]
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

Company names, salaries and jobs are sample data.

## Screenshots

| Jobs | Admin panel | Applicants |
|---|---|---|
| ![Jobs](./screenshots/jobs.png) | ![Admin](./screenshots/admin.png) | ![Applicants](./screenshots/applicants.png) |

## What I learned

- Building a full-stack app with the Next.js App Router and Server Actions instead of a separate REST API
- Designing a relational database with Prisma and PostgreSQL
- Implementing role-based authorization and protecting data on the server
- Validating input with Zod and handling sessions securely with cookies

## Future improvements

- Resume upload and a full seeker profile
- Job alerts and email notifications
- Edit and close job listings
- Pagination and advanced filters (salary, job type)