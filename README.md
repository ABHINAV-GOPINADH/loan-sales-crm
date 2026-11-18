# Loan Sales & Call Centre CRM — CloudHouse Technologies

> Enterprise CRM system built for an intermediary company coordinating loan sales, call center operations, document verification, and bank loan approvals across ~20 employees.

---

## 📋 Project Overview

The **Loan Sales & Call Centre CRM** bridges customer loan requirements with partner lending institutions (HDFC, ICICI, SBI). 
- Every morning, the Admin assigns fresh and existing customer leads to call centre employees.
- Each employee works against a **daily target quota of 100 customer calls**, logging call statuses, recording interest, scheduling follow-ups, and collecting KYC/income documents.
- Once documents are verified, agents submit loan applications to partner banks. The Admin manages loan sanction letters, disbursement confirmations, and final file closures.
- An application-style **Mobile Admin UI** (`/mobile/*`) is provided on a dedicated URL to allow administrators full management capabilities on any smartphone viewport.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Fullstack React framework with SSR and API Routes |
| **Styling & UI** | Tailwind CSS + Lucide Icons | Responsive modern enterprise interface + Mobile App Layout |
| **Database** | SQLite / PostgreSQL via Prisma ORM | Relational schema with 8 models, foreign keys & cascades |
| **Authentication** | NextAuth.js (Credentials Provider) | Role-Based Access Control (`ADMIN` vs `STAFF`) with bcrypt |
| **Data Parsing** | PapaParse | Client/Server CSV ingestion for bulk lead imports |
| **Analytics** | Recharts / Custom SVG Funnels | Conversion funnel, bank disbursements & call quotas |

---

## 🚀 Live Demo & Repository URLs

- **Desktop Portal URL:** `http://localhost:3000` (or deployed live link)
- **Mobile Admin UI URL:** `http://localhost:3000/mobile/dashboard` (or deployed live link + `/mobile`)
- **Public GitHub Repository:** [https://github.com/ABHINAV-GOPINADH/loan-sales-crm](https://github.com/ABHINAV-GOPINADH/loan-sales-crm)

---

## 🔑 Test Credentials

| Role | Email Address | Password | Capabilities |
|---|---|---|---|
| **Admin** | `admin@cloudhouse.com` | `Admin@123` | Full control: Dashboards, CSV Bulk Upload, Lead Distribution, Employee Quotas, Bank & Scheme Config, Document Verification, Loan Sanctions |
| **Staff Agent 1** | `staff1@cloudhouse.com` | `Staff@123` | Rahul Sharma: 100-call quota tracking, assigned leads, click-to-dial, follow-ups, doc uploads, bank apps |
| **Staff Agent 2** | `staff2@cloudhouse.com` | `Staff@123` | Priya Patel: Calling queue, interested conversions, personal performance scorecard |
| **Staff Agent 3** | `staff3@cloudhouse.com` | `Staff@123` | Amit Verma: Assigned leads, callback reminders, loan status tracking |
| **Staff Agent 4** | `staff4@cloudhouse.com` | `Staff@123` | Sneha Rao: Calling queue and document collection |

> **Tip:** The `/login` page includes **One-Click Demo Login** buttons for instant testing without typing credentials!

---

## 🌟 Key Functional Modules

### 1. Admin Portal (`/admin/*`)
- **Dashboard & Statistics (`/admin/dashboard`):** Real-time KPIs (Total Leads, Today's Team Calls vs Quota, Active Staff, Disbursed Capital), status pipeline cards, and live agent leaderboard.
- **Lead Management & Bulk Upload (`/admin/leads`):** Search, status/agent filtering, single lead creation, and **CSV Bulk Ingestion** with downloadable template (`/sample-leads-template.csv`).
- **Lead Distribution (`/admin/distribution`):**
  - **One-Click Auto Round-Robin:** Evenly divides unassigned customer leads across all active staff members.
  - **Manual Batch Assign:** Multi-select leads via checkboxes and assign to a selected employee.
- **Employee Management & Access Control (`/admin/employees`):** Manage ~20 staff members, toggle active/inactive status, and customize daily call targets (default: 100 calls/day).
- **Daily Call Targets & Performance Tracking (`/admin/calls`):** Live quota achievement bars (completed calls vs 100), conversion ratios, and a stream of recent call interaction logs.
- **Document Collection & Verification (`/admin/documents`):** Review Aadhaar, PAN, Salary Slips, and Bank Statements; one-click **Verify** or **Reject** with underwriter remarks.
- **Bank & Loan Scheme Management (`/admin/banks`):** Manage partner institutions (HDFC, ICICI, SBI) and configure loan schemes (Personal, Home, Vehicle, Business, Education) with interest bands, tenures, and amount limits.
- **Loan Application Tracking & Closure (`/admin/loans`):** Underwriting stages (Submitted, Under Review, Approved, Disbursed, Rejected, Closed), sanction amount entry, and bank reference numbers.
- **Reports & Analytics (`/admin/reports`):** Full conversion funnel breakdown (Leads → Contacted → Interested → Docs → Applied → Approved → Disbursed), bank disbursement summaries, and **Export Performance to CSV**.

### 2. Staff / Call Centre Portal (`/staff/*`)
- **Agent Dashboard (`/staff/dashboard`):** Daily 100-call target progress meter, remaining calls counter, queue of leads to call next, and quick callback reminders.
- **Assigned Customer Leads (`/staff/leads`):** Filter by stage, search by name/phone, and quick-call button.
- **Comprehensive Lead File (`/staff/leads/[id]`):**
  - **Log Call Tab:** Dial customer, choose outcome (`CONNECTED`, `BUSY`, `NO_ANSWER`, etc.), mark `INTERESTED` or `NOT_INTERESTED`, schedule follow-up date/time, and save remarks. **Automatically increments today's call counter (+1)**!
  - **Documents Tab:** Upload customer KYC documents (`AADHAAR`, `PAN`, `SALARY_SLIP`, etc.) and view live verification feedback from Admin.
  - **Bank Application Tab:** Select partner bank schemes, submit loan application, and track sanction letter issuance.
- **Scheduled Follow-Up Reminders (`/staff/follow-ups`):** Dedicated agenda view of upcoming customer callbacks with direct click-to-call.
- **Document Verification Status (`/staff/documents`):** Track verification stage across all your assigned customers.
- **Loan Applications Follow-up (`/staff/loans`):** Follow up on underwriting and disbursement status.
- **Personal Performance Scorecard (`/staff/performance`):** Daily quota hit rate (%), conversion percentage, and team leaderboard.

### 3. Mobile Admin UI (`/mobile/*`)
- **Native App-Style Layout:** Accessible at `/mobile/dashboard` with responsive mobile container shell, top header, bottom tab navigation bar (`Dashboard`, `Leads`, `Distribute`, `Loans`, `More`), and full slide-out drawer menu.
- **100% Feature Parity:** Every single Admin page is available in mobile layout:
  - `/mobile/dashboard` — Mobile KPI cards, quota progress, stage chips
  - `/mobile/leads` — Card-based leads, quick search, mobile CSV upload
  - `/mobile/distribution` — One-tap round-robin distribute, batch selection
  - `/mobile/employees` — Quick quota editor, active toggles
  - `/mobile/calls` — Daily call target progress cards and activity stream
  - `/mobile/documents` — Touch-optimized approve/reject KYC modal
  - `/mobile/banks` — Mobile partner banks & scheme listing + add bank
  - `/mobile/loans` — Stage update modal with sanctioned amount input
  - `/mobile/reports` — Mobile funnel breakdown & CSV download

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node.js 24)
- pnpm (or npm / yarn)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/loan-sales-crm.git
   cd loan-sales-crm
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Initialize and Seed Database:**
   ```bash
   pnpm exec prisma db push
   node prisma/seed.js
   ```

4. **Run the Development Server:**
   ```bash
   pnpm run dev
   ```

5. **Open in Browser:**
   - Web App: [http://localhost:3000](http://localhost:3000)
   - Mobile Admin Layout: [http://localhost:3000/mobile/dashboard](http://localhost:3000/mobile/dashboard)

---

## 🗄️ Database Architecture

The schema contains 8 relational models managed via Prisma:
- `User`: Admin and Staff accounts with roles and passwords.
- `Lead`: Customer contact info, loan requirements, assigned agent, status pipeline.
- `CallLog`: Timestamped call interactions, outcomes, remarks, and scheduled follow-ups.
- `Document`: Customer KYC documents with approval status (`PENDING`, `VERIFIED`, `REJECTED`).
- `Bank`: Partner lending institutions with contact officers.
- `LoanScheme`: Product terms (Personal, Home, Vehicle, Business, Education, interest, limits).
- `LoanApplication`: End-to-end loan tracking with sanction amounts and bank ref numbers.
- `DailyTarget`: Per-agent daily 100-call quota tracking and interested conversion counts.

---

## 📦 Deployment to Vercel

1. Push the code to a GitHub repository.
2. Import the project into [Vercel](https://vercel.com).
3. Set environment variables:
   - `DATABASE_URL`: Hosted Postgres URL (Neon / Supabase / Vercel Postgres)
   - `NEXTAUTH_SECRET`: Any random 32-character string
   - `NEXTAUTH_URL`: Your deployed domain URL
4. If using PostgreSQL in production, update `prisma/schema.prisma` provider to `postgresql` and run `npx prisma db push`.
