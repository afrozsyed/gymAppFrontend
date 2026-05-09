# Gym CRM — Frontend

React + TypeScript web application for the Gym CRM SaaS. Designed for gym owners and staff to manage members, track expiries, and send reminders with minimal clicks. A Super Admin panel lets the platform operator create and manage gyms.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Server state | TanStack React Query v5 |
| Forms | React Hook Form + Zod |
| HTTP client | Axios |
| Global state | Zustand (persisted to localStorage) |
| Routing | React Router v6 |
| Notifications | react-hot-toast |
| Date utilities | date-fns |

---

## Project Structure

```
src/
├── main.tsx                        # Entry point
├── App.tsx                         # Route definitions (role-aware guards)
├── index.css                       # Tailwind base imports
│
├── types/                          # TypeScript interfaces
│   ├── auth.types.ts               # AuthResponse (gymName nullable), LoginRequest, DecodedToken
│   ├── member.types.ts             # Member, MemberRequest, PagedMembers
│   ├── plan.types.ts               # Plan, PlanRequest
│   ├── payment.types.ts            # PaymentRequest, PaymentResponse, PaymentMode
│   ├── dashboard.types.ts          # DashboardResponse
│   ├── report.types.ts             # ReportResponse, PlanStat
│   ├── profile.types.ts            # UserProfileResponse, UpdateProfileRequest, ChangePasswordRequest
│   └── admin.types.ts              # GymDetailResponse, CreateGymRequest, ResetPasswordRequest
│
├── store/
│   └── authStore.ts                # Zustand: token, role, name, gymName, gymId (persisted)
│
├── api/                            # Axios API modules
│   ├── axiosInstance.ts            # Base instance + interceptors
│   ├── authApi.ts
│   ├── membersApi.ts               # getAll supports MemberFilters (name, phone, planId, status)
│   ├── plansApi.ts
│   ├── paymentsApi.ts              # record payment, get payment history
│   ├── dashboardApi.ts
│   ├── remindersApi.ts
│   ├── reportApi.ts                # getMonthly(year, month)
│   ├── profileApi.ts               # getProfile, updateProfile, changePassword
│   └── adminApi.ts                 # getAllGyms, createGym, activate/deactivate, resetPassword
│
├── hooks/                          # React Query hooks
│   ├── useDashboard.ts
│   ├── useMembers.ts               # CRUD + filters in query key
│   ├── usePlans.ts
│   ├── usePayments.ts              # useRecordPayment, usePaymentHistory
│   ├── useReport.ts                # useMonthlyReport(year, month)
│   ├── useProfile.ts               # useProfile, useUpdateProfile, useChangePassword
│   └── useAdmin.ts                 # useAllGyms, useCreateGym, useActivateGym, useDeactivateGym, useResetPassword
│
├── pages/                          # Route-level components
│   ├── LoginPage.tsx               # Login form + backend health check button
│   ├── DashboardPage.tsx
│   ├── MembersPage.tsx
│   ├── MemberFormPage.tsx          # Used for both Add and Edit
│   ├── PlansPage.tsx
│   ├── ReportsPage.tsx             # Monthly report — numbers only, print-to-PDF
│   ├── ProfilePage.tsx             # Profile info + change password (all roles)
│   └── SuperAdminPage.tsx          # Gym list + create gym form (SUPER_ADMIN only)
│
└── utils/
    └── whatsapp.ts                 # openWhatsApp() — opens wa.me link with pre-filled message
│
└── components/
    ├── layout/
    │   ├── AppLayout.tsx           # Sidebar + main content shell (mobile hamburger)
    │   ├── Sidebar.tsx             # Role-aware nav links + real gym name + logout
    │   └── ProtectedRoute.tsx      # Exports ProtectedRoute, SuperAdminRoute, GymRoute
    ├── dashboard/
    │   ├── StatCard.tsx            # Coloured metric card
    │   └── MemberTable.tsx         # Alert members table with WhatsApp Remind button
    ├── members/
    │   ├── MemberList.tsx          # Filter bar + paginated table; Edit/Renew/Remind/Delete
    │   ├── MemberForm.tsx          # React Hook Form + Zod validated form
    │   └── RecordPaymentModal.tsx  # Renewal modal — plan, amount, payment mode, notes
    ├── profile/
    │   └── ChangePasswordModal.tsx # Old / new / confirm password modal (all roles)
    ├── plans/
    │   └── PlanList.tsx            # Plan table + inline Add form
    └── common/
        ├── LoadingSpinner.tsx
        ├── ErrorBanner.tsx
        └── Pagination.tsx
```

---

## Running Locally

### Prerequisites
- Node.js 20+
- Backend running on `http://localhost:8081`

### Install and start

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**

The Vite dev server proxies all `/api` requests to `http://localhost:8080`, so no CORS issues during development.

### Build for production

```bash
npm run build
# Output is in dist/
```

### Docker

```bash
docker build -t gymcrm-frontend .
docker run -p 80:80 gymcrm-frontend
```

The nginx container proxies `/api/` to the `app` backend service.

---

## Authentication Flow

1. User submits Login form.
2. API returns `{ token, role, name, gymName }`. `gymName` is `null` for `SUPER_ADMIN`.
3. Token + gymName stored in **Zustand** (persisted to `localStorage` via `zustand/middleware/persist`). `gymId` is decoded from JWT claims (absent for SUPER_ADMIN).
4. Sidebar and mobile header display the real gym name (or "GymCRM Admin" for SUPER_ADMIN).
5. All subsequent API requests automatically include `Authorization: Bearer <token>` via Axios request interceptor.
6. On any `401` response, the Axios response interceptor clears the token and redirects to `/login`.
7. `ProtectedRoute` checks token validity (expiry decoded from JWT) on every route change.
8. On login, the app navigates to `/admin` if role is `SUPER_ADMIN`, otherwise to `/dashboard`.
9. If a gym is deactivated, login returns `403` with `"Your gym account is deactivated. Please contact admin."` — shown as a toast.

---

## Roles and Route Guards

Three route guard components are exported from [ProtectedRoute.tsx](src/components/layout/ProtectedRoute.tsx):

| Guard | Who can access |
|---|---|
| `ProtectedRoute` | Any authenticated user |
| `SuperAdminRoute` | `SUPER_ADMIN` only — redirects others to `/dashboard` |
| `GymRoute` | `ADMIN` / `STAFF` only — redirects `SUPER_ADMIN` to `/admin` |

---

## Routing

| Path | Page | Guard |
|---|---|---|
| `/login` | LoginPage | Public |
| `/admin` | SuperAdminPage | SuperAdminRoute |
| `/dashboard` | DashboardPage | GymRoute |
| `/members` | MembersPage | GymRoute |
| `/members/new` | MemberFormPage (Add) | GymRoute |
| `/members/:id/edit` | MemberFormPage (Edit) | GymRoute |
| `/plans` | PlansPage | GymRoute |
| `/reports` | ReportsPage | GymRoute |
| `/profile` | ProfilePage | ProtectedRoute (any auth) |
| `/` | Redirects to `/dashboard` | — |

---

## Screens

---

### Login

**Path:** `/login`

A centred card with email and password fields. Validated with Zod before submission.

**Behaviour:**
- On success → navigates to `/admin` (SUPER_ADMIN) or `/dashboard` (ADMIN/STAFF)
- On failure → toast with the server error message ("Invalid email or password" or "Your gym account is deactivated...")
- No public registration link — gym accounts are created by the Super Admin

**Backend health check (below the form):**
- A "Check Status" button calls `GET /api/health`
- Shows a colour-coded indicator: gray (unknown) → yellow pulsing (checking) → green dot (connected) → red dot (unreachable)
- Useful for diagnosing connectivity issues when the Render free tier is cold-starting

---

### Super Admin — Gym Management

**Path:** `/admin` (SUPER_ADMIN only)

Two sections on one page:

**Create Gym form (top):**

| Field | Notes |
|---|---|
| Gym Name | Required |
| Owner Name | Required |
| Email | Required, valid email — becomes the ADMIN login |
| Phone | Optional |
| Password | Required, min 6 chars |

On submit: gym + admin user created atomically. Form resets. Gym list refreshes.

**Gym List (below):**

Table / mobile card list of all gyms:

| Column | Notes |
|---|---|
| Gym Name | |
| Owner | |
| Email | |
| Phone | |
| Status | Green `ACTIVE` or red `INACTIVE` badge |
| Actions | Activate / Deactivate toggle · Reset Password button |

**Reset Password modal:** Single "New Password" field. Sets a new password for the gym's ADMIN user without requiring the old one.

---

### Dashboard

**Path:** `/dashboard` (ADMIN / STAFF)

The main screen. Loads on login and auto-refreshes every 60 seconds.

**Stat cards (top row):**

| Card | Colour | What it shows |
|---|---|---|
| Expired Members | Red | Members whose expiry date has passed |
| Expiring Today | Yellow | Members whose expiry date is today |
| Pending Payments (₹) | Blue | Sum of plan prices for PENDING members |
| Total Members | Green | Total member count for the gym |

**Members Needing Attention table (below cards):**

Shows up to 20 members who are expired, expiring today, or have pending payments. Columns: Name, Phone, Plan, Expiry date, Status badge, Payment badge, Remind button.

**Remind button:** Opens WhatsApp Web/app with a pre-filled message referencing the member's name and expiry date. Message text adapts based on status — expired vs. expiring soon.

**Actions:** `+ Add Member` → `/members/new` · `View all members →` → `/members`

---

### Member List

**Path:** `/members` (ADMIN / STAFF)

A paginated table of all gym members, sorted by creation date (newest first) by default.

**Filter bar (top of page):**

| Filter | Type | Behaviour |
|---|---|---|
| Name | Text | Debounced 300 ms, partial case-insensitive match |
| Phone | Text | Debounced 300 ms, partial match |
| Plan | Dropdown | Exact plan match by ID |
| Status | Dropdown | ACTIVE / EXPIRING TODAY / EXPIRED — computed from `expiryDate` |

All filters are server-side — pagination works correctly across filtered results. A **Clear** button appears when any filter is active. Page resets to 0 on any filter change.

**Columns:** Name, Phone, Plan, Joined date, Expiry date, Status badge, Payment badge, Actions (Edit | Renew | Remind | Delete)

**Pagination:** 20 members per page. Count label shows "N results found" when filters are active.

**Remind button:** Opens WhatsApp Web (desktop) or WhatsApp app (mobile) via `wa.me/<phone>?text=<encoded>` with a pre-filled membership expiry message. No backend API call is made — the user sends the message from their WhatsApp.

**Status badges:**

| Badge | Colour | Condition |
|---|---|---|
| ACTIVE | Green | Expiry in the future |
| EXPIRING TODAY | Yellow | Expiry is today |
| EXPIRED | Red | Expiry has passed |

---

### Record Payment Modal

**Trigger:** Clicking the green **Renew** button on any member row.

An overlay modal. Records a payment and renews the membership in one step.

**Fields:**

| Field | Notes |
|---|---|
| Plan | Dropdown pre-selected to current plan. Changing plan auto-fills the amount and shows the new projected expiry. |
| Amount (₹) | Auto-filled from the selected plan's price. Editable. |
| Payment Mode | Cash / Card / UPI / Bank Transfer / Other |
| Notes | Optional free text |

On submit: calls `POST /api/members/{id}/payments` → expiry updated, status set to PAID → modal closes, list refreshes.

---

### Add / Edit Member

**Path:** `/members/new` · `/members/:id/edit`

| Field | Type | Notes |
|---|---|---|
| Full Name | text | Required |
| Phone | text | Optional |
| Join Date | date picker | Required, defaults to today |
| Plan | dropdown | Loaded from `/api/plans` |
| Payment Status | radio (PAID / PENDING) | Required |

Expiry date preview shown as a read-only computed info box (`joinDate + plan.durationDays`).

---

### Reports

**Path:** `/reports` (ADMIN / STAFF)

Monthly summary report — numbers only, no charts.

**Navigation:** ← → arrows to move between months. The next-month arrow is disabled when viewing the current month.

**Print / PDF:** A "Print" button calls `window.print()`. The header, navigation controls, and sidebar are hidden in print mode (`print:hidden`); a print-only title replaces them (`hidden print:block`). Use the browser's "Save as PDF" option for a clean PDF export.

**Sections:**

| Section | Metrics |
|---|---|
| Membership Overview | Total Members, Active Members, Expired Members, New Joiners this month |
| Revenue | Revenue This Month (₹), Renewed Members, Pending Amount (₹) |
| Plan-wise Breakdown | Table: Plan name, Renewals, Revenue — with totals row |

All amounts formatted in Indian locale (₹ with lakh/crore separators).

---

### Plans

**Path:** `/plans` (ADMIN / STAFF)

Inline add form (name, duration days, price) + plan table with delete.

---

### Profile

**Path:** `/profile` (all roles)

Two sections:

**Profile Info:**

| Field | Editable? |
|---|---|
| Name | Yes (all roles) |
| Email | Read-only |
| Phone | Read-only |
| Gym Name | Yes — ADMIN only |

On save: name and gym name (if ADMIN) updated. Sidebar refreshes immediately to show new name/gym name.

**Change Password:**

Button opens `ChangePasswordModal` with three fields: Current Password, New Password, Confirm New Password. The backend validates old password correctness before accepting the change.

---

## State Management

### Auth Store (Zustand)

Persisted to `localStorage` under the key `gym-crm-auth`.

```typescript
{
  token: string | null
  role: string | null          // "ADMIN" | "STAFF" | "SUPER_ADMIN"
  name: string | null
  gymName: string | null       // null for SUPER_ADMIN
  gymId: number | null         // null for SUPER_ADMIN (not in JWT)

  login(token, role, name, gymName)  // Called after successful login
  logout()                           // Clears all fields + localStorage
  isAuthenticated()                  // Checks token existence + expiry
}
```

### Server State (React Query)

All API data lives in React Query — not in component state or Zustand. Cache keys:

| Data | Query key |
|---|---|
| Dashboard | `['dashboard']` |
| Members list | `['members', 'list', { page, size, ...filters }]` |
| Single member | `['members', 'detail', id]` |
| Plans | `['plans']` |
| Payment history | `['payments', memberId]` |
| Monthly report | `['reports', 'monthly', { year, month }]` |
| Profile | `['profile']` |
| Admin gym list | `['admin', 'gyms']` |

On any create/update/delete mutation success, the relevant list query is invalidated so the UI refreshes automatically.

---

## Form Validation

All forms use **React Hook Form** with **Zod** resolvers. Validation runs on submit; inline error messages appear below each invalid field.

---

## API Communication

### Axios instance (`src/api/axiosInstance.ts`)

- **Base URL:** `/api` (proxied to `http://localhost:8081` in dev)
- **Request interceptor:** Reads token from Zustand store and adds `Authorization: Bearer <token>`
- **Response interceptor:** On `401`, calls `logout()` and redirects to `/login`

---

## Environment Variables

```env
# .env (not committed — only needed if overriding the Vite proxy)
VITE_API_BASE_URL=http://localhost:8081
```

In development, the Vite dev server proxies all `/api` requests to `http://localhost:8081` (configured in `vite.config.ts`), so no CORS issues and no env variable required.

---

## Production Deployment (Vercel)

The frontend is deployed on **Vercel**. API calls are proxied server-side via `vercel.json` rewrites, so no CORS configuration is needed on the backend.

### `vercel.json` (in `frontend/`)

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://<your-render-url>/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

The first rewrite proxies all `/api/*` requests to the Render backend. The second rewrite is the SPA fallback (required for client-side routing — without it, direct URL navigation returns 404).

### Deploy steps

1. Push the `frontend/` directory to GitHub (can be a monorepo — Vercel supports root directory config).
2. [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Set **Root Directory** to `frontend`.
4. Set **Framework Preset** to `Vite`.
5. No environment variables are needed — the proxy in `vercel.json` handles API routing.
6. Click **Deploy**.

### Free tier behaviour
- Vercel free tier has no cold start — the static site is always served instantly from CDN.
- API latency on first request may be slow if the Render backend is cold-starting (~30 s). The Login page health check button helps diagnose this.
