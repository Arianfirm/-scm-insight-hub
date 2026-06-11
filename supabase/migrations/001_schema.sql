-- ============================================================
-- SCM Insight Hub — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Profiles ─────────────────────────────────────────────────
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text default 'member',
  department text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view all profiles" on profiles
  for select using (auth.role() = 'authenticated');

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Meetings ─────────────────────────────────────────────────
create table if not exists meetings (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  meeting_date date not null,
  meeting_type text not null check (meeting_type in (
    'weekly_review','ops_review','cross_function','planning','channel_ops','ad_hoc'
  )),
  participants text[] default '{}',
  summary text,
  attachment_urls text[] default '{}',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table meetings enable row level security;
create policy "Authenticated users can manage meetings" on meetings
  for all using (auth.role() = 'authenticated');

-- ─── Issues ───────────────────────────────────────────────────
create table if not exists issues (
  id uuid default uuid_generate_v4() primary key,
  meeting_id uuid references meetings(id) on delete set null,
  title text not null,
  category text not null check (category in (
    'intercompany','warehouse','inventory','fulfillment',
    'transportation','marketplace','planning','procurement'
  )),
  description text,
  impact_level text not null default 'medium' check (impact_level in ('low','medium','high','critical')),
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  owner_id uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table issues enable row level security;
create policy "Authenticated users can manage issues" on issues
  for all using (auth.role() = 'authenticated');

-- ─── Root Cause Analysis ──────────────────────────────────────
create table if not exists root_causes (
  id uuid default uuid_generate_v4() primary key,
  issue_id uuid references issues(id) on delete cascade not null,
  methodology text not null check (methodology in ('5_why','fishbone')),
  -- 5 Why
  why_1 text,
  why_2 text,
  why_3 text,
  why_4 text,
  why_5 text,
  root_cause_statement text,
  -- Fishbone
  fishbone_man text,
  fishbone_method text,
  fishbone_machine text,
  fishbone_material text,
  fishbone_environment text,
  fishbone_measurement text,
  -- Meta
  validated_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table root_causes enable row level security;
create policy "Authenticated users can manage root causes" on root_causes
  for all using (auth.role() = 'authenticated');

-- ─── Actions ──────────────────────────────────────────────────
create table if not exists actions (
  id uuid default uuid_generate_v4() primary key,
  issue_id uuid references issues(id) on delete set null,
  meeting_id uuid references meetings(id) on delete set null,
  title text not null,
  description text,
  pic_id uuid references profiles(id) on delete set null,
  due_date date,
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  status text not null default 'open' check (status in ('open','in_progress','completed','cancelled')),
  completion_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table actions enable row level security;
create policy "Authenticated users can manage actions" on actions
  for all using (auth.role() = 'authenticated');

-- ─── KPI Records ──────────────────────────────────────────────
create table if not exists kpi_records (
  id uuid default uuid_generate_v4() primary key,
  issue_id uuid references issues(id) on delete set null,
  action_id uuid references actions(id) on delete set null,
  metric_name text not null,
  metric_unit text,
  value_before numeric,
  value_after numeric,
  improvement_pct numeric generated always as (
    case when value_before != 0 and value_before is not null and value_after is not null
    then round(((value_after - value_before) / value_before * 100)::numeric, 1)
    else null end
  ) stored,
  measured_at date,
  notes text,
  created_at timestamptz default now()
);

alter table kpi_records enable row level security;
create policy "Authenticated users can manage kpi_records" on kpi_records
  for all using (auth.role() = 'authenticated');

-- ─── Decisions ────────────────────────────────────────────────
create table if not exists decisions (
  id uuid default uuid_generate_v4() primary key,
  meeting_id uuid references meetings(id) on delete cascade not null,
  description text not null,
  owner_id uuid references profiles(id) on delete set null,
  decided_at date not null default current_date,
  created_at timestamptz default now()
);

alter table decisions enable row level security;
create policy "Authenticated users can manage decisions" on decisions
  for all using (auth.role() = 'authenticated');

-- ─── Risks ────────────────────────────────────────────────────
create table if not exists risks (
  id uuid default uuid_generate_v4() primary key,
  meeting_id uuid references meetings(id) on delete set null,
  title text not null,
  description text,
  impact integer not null check (impact between 1 and 5),
  probability integer not null check (probability between 1 and 5),
  risk_score integer generated always as (impact * probability) stored,
  risk_level text generated always as (
    case
      when (impact * probability) >= 15 then 'critical'
      when (impact * probability) >= 8 then 'high'
      when (impact * probability) >= 4 then 'medium'
      else 'low'
    end
  ) stored,
  mitigation_plan text,
  owner_id uuid references profiles(id) on delete set null,
  status text not null default 'open' check (status in ('open','mitigated','accepted','closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table risks enable row level security;
create policy "Authenticated users can manage risks" on risks
  for all using (auth.role() = 'authenticated');

-- ─── AI Jobs (Future-Ready) ────────────────────────────────────
create table if not exists ai_summary_jobs (
  id uuid default uuid_generate_v4() primary key,
  meeting_id uuid references meetings(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending','processing','done','failed')),
  transcript_url text,
  summary_output text,
  action_items_output jsonb default '[]',
  risk_flags_output jsonb default '[]',
  created_at timestamptz default now()
);

alter table ai_summary_jobs enable row level security;
create policy "Authenticated users can view ai jobs" on ai_summary_jobs
  for select using (auth.role() = 'authenticated');

-- ─── Updated At Trigger ───────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger meetings_updated_at before update on meetings
  for each row execute function update_updated_at();
create trigger issues_updated_at before update on issues
  for each row execute function update_updated_at();
create trigger actions_updated_at before update on actions
  for each row execute function update_updated_at();
create trigger root_causes_updated_at before update on root_causes
  for each row execute function update_updated_at();
create trigger risks_updated_at before update on risks
  for each row execute function update_updated_at();

-- ─── Indexes ──────────────────────────────────────────────────
create index if not exists idx_issues_meeting_id on issues(meeting_id);
create index if not exists idx_issues_status on issues(status);
create index if not exists idx_actions_issue_id on actions(issue_id);
create index if not exists idx_actions_status on actions(status);
create index if not exists idx_actions_due_date on actions(due_date);
create index if not exists idx_actions_pic_id on actions(pic_id);
create index if not exists idx_decisions_meeting_id on decisions(meeting_id);
create index if not exists idx_risks_meeting_id on risks(meeting_id);
create index if not exists idx_kpi_records_issue_id on kpi_records(issue_id);
