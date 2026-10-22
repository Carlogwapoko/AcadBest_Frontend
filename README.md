# AcadBest – ACES Tagum College

Angular 22 · standalone components · role-based lazy-loaded pages · Plus Jakarta Sans + Poppins.

## Run locally

Start `Backend/AcadBest_Backend` with `php artisan serve --port 8000`, configure its `FRONTEND_URL` for the Angular origin, and seed the database with `php artisan migrate --seed`. Then run:

```bash
npm install
npm start
npm run build
npm test
```

The development server runs at `http://localhost:4200`; the client calls `http://localhost:8000/api`.

## Demo accounts

The backend seeds these local testing accounts with password `AcadBest-Demo-2026!` (overridable by `DEMO_PASSWORD`):

| Role | E-mail |
|---|---|
| Student | `student@aces.edu.ph` |
| Faculty | `faculty@aces.edu.ph` |
| Registrar Staff | `registrar@aces.edu.ph` |
| Admin | `admin@aces.edu.ph` |

Change the demo password before using these accounts outside local development.

## Application structure

- `src/app/core/`: API-backed authentication and data access, grading logic, guards, and navigation.
- `src/app/shared/`: reusable form, icon, modal, announcement, request-detail, and UI-host components.
- `src/app/layout/`: the role-aware application shell and profile page.
- `src/app/features/public/`: landing page, login, and online enrollment.
- `src/app/features/student/`: dashboard, grades, requests, announcements, and notifications.
- `src/app/features/faculty/`: dashboard, subjects, grade entry, at-risk students, and supporting components.
- `src/app/features/registrar/`: request queue, enrollment, subjects/units, announcements, and supporting components.
- `src/app/features/admin/`: user roles, standing rules, and access control.

Each role has its own route file and role guard. Role-specific pages are lazy-loaded, and the shell navigation adapts to narrow screens with a slide-in menu.

Registrar subject offerings can be filtered by session, semester, and academic year. Student subject lists can be filtered by term, and faculty grade entry can be filtered by student session. Missing historical offering details are shown as a dash. Administrators configure the current academic school year under Standing Rules; new enrollment applications save their own school year for historical review.

Profiles are read-only for signed-in users. Administrators manage account pictures from Users & Roles; the browser validates/resizes the image and the backend stores it on the public disk. Frontend guards support navigation while backend middleware enforces authorization and record scope.
