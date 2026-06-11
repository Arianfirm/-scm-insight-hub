# SCM Insight Hub

> Turn Meetings Into Actions. Turn Actions Into Impact.

Supply Chain Continuous Improvement platform — tracks issues, actions, root causes, KPIs, decisions, and risks from SCM meetings.

---

## Stack

- **Framework**: Next.js 15 App Router + TypeScript
- **Database / Auth**: Supabase (Postgres + Row Level Security)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Deployment**: Vercel

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-org/scm-insight-hub
cd scm-insight-hub
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **Anon Key** from Settings → API

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Database Migrations

In Supabase → **SQL Editor**, run these files **in order**:

1. `supabase/migrations/001_schema.sql` — creates all tables, RLS policies, triggers
2. `supabase/migrations/002_seed.sql` — inserts realistic demo data

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Create Your Account

- Click **Create account** on the login page
- After signing up, your profile is auto-created
- The seed data from step 4 will already be visible

---

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy** — done!

---

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | KPI cards, action trend charts, overdue alerts |
| **Meetings** | Record meetings with type, participants, summary |
| **Issues** | Log issues by category (warehouse, fulfillment, etc.) |
| **Root Cause** | 5-Why and Fishbone analysis per issue |
| **Actions** | Table + Kanban view, PIC assignment, due dates |
| **KPI Impact** | Before/after measurements with % improvement |
| **Decisions** | Decision log grouped by month |
| **Risk Register** | 5×5 heatmap, risk scoring, mitigation tracking |
| **Settings** | Profile edit, team directory |

---

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Protected routes (dashboard, meetings, etc.)
│   └── auth/           # Login & register
├── components/
│   ├── ui/             # Reusable UI primitives
│   ├── layout/         # Sidebar
│   └── modules/        # Feature-specific components
├── lib/supabase/       # Client, server, middleware helpers
├── types/              # TypeScript interfaces
└── utils/              # Formatting, color helpers
supabase/
└── migrations/
    ├── 001_schema.sql
    └── 002_seed.sql
```

---

## Supabase Email Confirmation (Optional)

For local dev, you can disable email confirmation:
Supabase Dashboard → Authentication → Settings → **Disable email confirmations**
