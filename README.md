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
│   ├── report.types.ts             # ReportResponse, YearlyReport, PlanStat, StaffAttendanceStat, MonthlyBreakdown
│   ├── staff.types.ts              # Staff, StaffRequest, PagedStaff, AttendanceRecord, AttendanceRequest
│   ├── profile.types.ts            # UserProfileResponse, UpdateProfileRequest, ChangePasswordRequest
│   ├── admin.types.ts              # GymDetailResponse (includes plan fields), CreateGymRequest, ResetPasswordRequest
│   └── subscription.types.ts      # SubscriptionPlan, CurrentSubscription, AssignSubscriptionRequest, SubscriptionPlanRequest
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
│   ├── reportApi.ts                # getMonthly(year, month), getYearly(year), getRange(start, end)
│   ├── staffApi.ts                 # Staff CRUD + markAttendance + getMonthlyAttendance
│   ├── profileApi.ts               # getProfile, updateProfile, changePassword
│   ├── adminApi.ts                 # getAllGyms, createGym, activate/deactivate, resetPassword
│   └── subscriptionApi.ts          # getCurrent, getAllPlans, adminGetAllPlans, adminUpdatePlan, adminAssignSubscription
│
├── hooks/                          # React Query hooks
│   ├── useDashboard.ts
│   ├── useMembers.ts               # CRUD + filters in query key
│   ├── usePlans.ts
│   ├── usePayments.ts              # useRecordPayment, usePaymentHistory
│   ├── useReport.ts                # useMonthlyReport, useYearlyReport, useRangeReport
│   ├── useStaff.ts                 # useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff, useMarkAttendance, useMonthlyAttendance
│   ├── useProfile.ts               # useProfile, useUpdateProfile, useChangePassword
│   ├── useAdmin.ts                 # useAllGyms, useCreateGym, useActivateGym, useDeactivateGym, useResetPassword
│   └── useSubscription.ts          # useCurrentSubscription, useSubscriptionPlans, useAdminPlans, useUpdatePlan, useAssignSubscription
│
├── pages/                          # Route-level components
│   ├── LoginPage.tsx               # Login form + backend health check button
│   ├── DashboardPage.tsx
│   ├── MembersPage.tsx
│   ├── MemberFormPage.tsx          # Used for both Add and Edit
│   ├── PlansPage.tsx
│   ├── ReportsPage.tsx             # 3-tab report (Monthly/Yearly/Custom) with tables and staff attendance, print-to-PDF
│   ├── StaffPage.tsx               # Staff list page wrapper
│   ├── StaffFormPage.tsx           # Add/Edit staff (React Hook Form + Zod)
│   ├── ProfilePage.tsx             # Profile info + change password (all roles)
│   ├── SuperAdminPage.tsx          # Gym management + subscription plan management (SUPER_ADMIN only)
│   └── SubscriptionPage.tsx        # Current plan info + plan comparison grid (gym users)
│
├── utils/
│   └── whatsapp.ts                 # openWhatsApp() — opens wa.me link with pre-filled message
│
└── components/
    └── staff/
        ├── StaffList.tsx           # Filter bar + paginated table; Edit/Attendance/Delete actions
        └── AttendanceModal.tsx     # Monthly calendar + mark attendance (upsert)
│
└── components/
    ├── layout/
    │   ├── AppLayout.tsx           # Sidebar + main content shell (mobile hamburger)
    │   ├── Sidebar.tsx             # Role-aware nav links + real gym name + logout + ✦ Pro lock badges
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
        ├── Pagination.tsx
        └── FeatureGate.tsx         # Full-page lock for premium features; shows "View Plans" upgrade prompt
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
| `/staff` | StaffPage | GymRoute |
| `/staff/new` | StaffFormPage (Add) | GymRoute |
| `/staff/:id/edit` | StaffFormPage (Edit) | GymRoute |
| `/subscription` | SubscriptionPage | GymRoute |
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

### Super Admin — Gym & Subscription Management

**Path:** `/admin` (SUPER_ADMIN only)

Three sections on one page:

**1. Subscription Plans table (top):**

Editable table of all subscription plan definitions:

| Column | Notes |
|---|---|
| Plan | Display name (Basic / Pro / Pro Plus) |
| Price/mo | Monthly price in ₹ |
| Members | Member limit (-1 shown as ∞) |
| Staff | Staff limit (-1 shown as ∞) |
| Yearly / Custom / Staff / Attend. / Remind. | Feature flags (✓ / ✗) |
| Edit | Opens EditPlanModal |

**EditPlanModal:** Edit display name, description, price, member limit, staff limit, and five feature toggle checkboxes. -1 = unlimited for limits.

**2. Create Gym button** — top-right of the gym section header.

Opens **CreateGymModal** with fields: Gym Name, Owner Name, Email, Phone (optional), Password.

On submit: gym + admin user created atomically. Form resets. Gym list refreshes.

**3. Gym List table / mobile cards:**

| Column | Notes |
|---|---|
| Gym Name | |
| Owner | |
| Email | |
| Plan | Colored badge — gray (No Plan), blue (Pro), purple (Pro Plus) |
| Expires | Plan expiry date formatted as "1 Jun 2026" |
| Members | Current registered member count |
| Staff | Current registered staff count |
| Status | Green `ACTIVE` or red `INACTIVE` badge |
| Actions | Activate/Deactivate · **Assign Plan** · Reset PW |

**Assign Plan modal:** Plan dropdown (shows price) + duration select (1 / 3 / 6 / 12 months). Existing active subscription is cancelled and replaced.

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

A 3-tab professional report interface — numbers and tables, no charts.

**Tabs:**

| Tab | Description |
|---|---|
| Monthly | Month navigator (← →). Stats for the selected month. Next-month arrow disabled on current month. |
| Yearly | Year navigator (← →). Full-year aggregates + 12-row month-by-month breakdown table. |
| Custom | Start + End date pickers. "Generate Report" button fetches data only on click. |

**Print / PDF:** A "Print" button (top-right, hidden when printing) calls `window.print()`. Tab bar, navigator controls, and sidebar are hidden in print mode; a clean title replaces them. Use the browser's "Save as PDF" option.

**Sections (all tabs):**

| Section | Content |
|---|---|
| Membership Overview | Stat cards: Total Members, Active, Expired, New Joiners (period-scoped) |
| Revenue | Stat cards: Revenue Collected, Members Renewed, Pending Amount (all unpaid) |
| Plan-wise Revenue | Table: Plan name \| Renewals \| Revenue — with totals row |
| Staff Attendance | Table: Staff name \| Role \| Present \| Absent \| Half Day \| Leave \| Total — with totals row |

**Yearly tab only — additional section:**

| Section | Content |
|---|---|
| Month-by-Month Breakdown | 12-row table: Month \| New Joiners \| Renewals \| Revenue — with totals row |

All amounts formatted in Indian locale (₹ with lakh/crore separators).

**Subscription gating:**

| Tab | Required Plan |
|---|---|
| Monthly | All plans |
| Yearly | Pro or higher |
| Custom | Pro Plus |

Locked tabs show an inline upgrade prompt (lock icon + "View Plans" button) instead of the report content. The backend also enforces this with a `403` error.

---

### Subscription

**Path:** `/subscription` (ADMIN / STAFF)

Shows the gym's current subscription status and a plan comparison grid.

**Current Plan card:**
- Plan name badge + Active/Expired/None status
- Valid until date (if active)
- Member usage bar: `current / limit` with color-coding (green → yellow at 70% → red at 90%)
- Staff usage bar: same
- Price per month

**Plan Comparison grid (3 cards):**

Each card shows: display name, price, member limit, staff limit, and a feature checklist (✓/✗):
- Dashboard & Members — included in all plans
- Plans & Payments — included in all plans
- Monthly Reports — included in all plans
- Yearly Reports — Pro and above
- Custom Date Reports — Pro Plus only
- Staff Management — Pro and above
- Staff Attendance — Pro and above
- WhatsApp Reminders — Pro and above

Current plan card is highlighted with a blue border and "Current Plan" badge.

Footer: "To upgrade or change your plan, contact your gym administrator."

---

### Plans

**Path:** `/plans` (ADMIN / STAFF)

Inline add form (name, duration days, price) + plan table with delete.

---

### Staff List

**Path:** `/staff` (ADMIN / STAFF)

A paginated table of all gym staff members, sorted by creation date.

**Filter bar:** Name search (debounced 300 ms), Role dropdown, Status dropdown, Clear button, "+ Add Staff" button.

**Table columns:** Name, Phone, Email, Role badge, Join Date, Salary, Status badge, Actions (Edit | Attendance | Delete)

**Role badge:** Blue pill — Trainer / Receptionist / Manager / Cleaner / Other

**Status badges:**

| Badge | Colour |
|---|---|
| ACTIVE | Green |
| INACTIVE | Gray |
| ON_LEAVE | Yellow |

---

### Add / Edit Staff

**Path:** `/staff/new` · `/staff/:id/edit`

| Field | Required | Notes |
|---|---|---|
| Full Name | Yes | |
| Phone | No | |
| Email | No | |
| Join Date | Yes | Defaults to today |
| Role | Yes | Trainer / Receptionist / Manager / Cleaner / Other |
| Status | Yes | Active / Inactive / On Leave |
| ID Proof Type | No | Aadhar / PAN / Passport / Driving License / Voter ID |
| ID Proof Number | No | |
| Salary (₹) | No | |
| Address | No | Textarea |

---

### Attendance Modal

**Trigger:** Clicking the **Attendance** button on any staff row.

An overlay modal with:
- **Month navigation** (← →, next-month arrow disabled on current month)
- **Summary row**: Present / Absent / Half-Day / Leave counts for the month
- **Monthly calendar grid**: 7-column week layout. Each day shows a coloured dot — green (Present), red (Absent), yellow (Half Day), blue (Leave), gray (unmarked). Today's date is highlighted with a blue ring.
- **Mark Attendance section** (bottom): Date picker (max = today), Status select, Notes input, "Mark Attendance" button. Submitting the same date twice **updates** the existing record (upsert — no duplicate error).

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
| Monthly report | `['reports', 'monthly', year, month]` |
| Yearly report | `['reports', 'yearly', year]` |
| Custom range report | `['reports', 'range', start, end]` |
| Staff list | `['staff', 'list', { page, size, ...filters }]` |
| Single staff | `['staff', 'detail', id]` |
| Staff attendance | `['staff', 'attendance', staffId, { year, month }]` |
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
