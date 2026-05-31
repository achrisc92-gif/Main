-- BLOCK — AI Sales Admin
-- Initial Supabase schema
-- Run this file in Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Utility: updated_at trigger
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Profiles
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  role text,
  company text,
  sales_style text,
  default_crm text not null default 'Salesforce',
  default_framework text not null default 'MEDDICC',
  email_signature text,
  gmail_email text,
  gmail_connected boolean not null default false,
  gmail_access_token text,
  gmail_refresh_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Opportunities
-- ------------------------------------------------------------
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  contact_name text,
  contact_email text,
  deal_value numeric(14, 2),
  stage text not null default 'Discovery',
  health_score integer not null default 50 check (health_score >= 0 and health_score <= 100),
  next_best_action text,
  notes text,
  framework_analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists opportunities_user_id_idx on public.opportunities(user_id);
create index if not exists opportunities_health_score_idx on public.opportunities(health_score desc);
create index if not exists opportunities_stage_idx on public.opportunities(stage);

drop trigger if exists set_opportunities_updated_at on public.opportunities;
create trigger set_opportunities_updated_at
before update on public.opportunities
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Tasks
-- ------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  title text not null,
  due_date date,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'skipped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_opportunity_id_idx on public.tasks(opportunity_id);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists tasks_status_idx on public.tasks(status);

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Time Blocks
-- ------------------------------------------------------------
create table if not exists public.time_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text not null default 'crm' check (type in ('prospecting', 'discovery', 'followup', 'meeting', 'crm', 'pipeline', 'break', 'admin', 'other')),
  start_time time not null,
  end_time time not null,
  date date not null,
  notes text,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'completed', 'skipped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint time_blocks_valid_time check (end_time > start_time)
);

create index if not exists time_blocks_user_id_idx on public.time_blocks(user_id);
create index if not exists time_blocks_date_idx on public.time_blocks(date);
create index if not exists time_blocks_status_idx on public.time_blocks(status);

drop trigger if exists set_time_blocks_updated_at on public.time_blocks;
create trigger set_time_blocks_updated_at
before update on public.time_blocks
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- AI Outputs
-- ------------------------------------------------------------
create table if not exists public.ai_outputs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  input_notes text not null,
  crm text not null default 'Salesforce',
  framework text not null default 'MEDDICC',
  ai_mode text not null default 'ai' check (ai_mode in ('human', 'ai', 'director', 'export')),
  output_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_outputs_user_id_idx on public.ai_outputs(user_id);
create index if not exists ai_outputs_opportunity_id_idx on public.ai_outputs(opportunity_id);
create index if not exists ai_outputs_created_at_idx on public.ai_outputs(created_at desc);

-- ------------------------------------------------------------
-- Voice Notes
-- ------------------------------------------------------------
create table if not exists public.voice_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transcript text not null,
  duration integer,
  created_at timestamptz not null default now()
);

create index if not exists voice_notes_user_id_idx on public.voice_notes(user_id);
create index if not exists voice_notes_created_at_idx on public.voice_notes(created_at desc);

-- ------------------------------------------------------------
-- Agent Conversations
-- ------------------------------------------------------------
create table if not exists public.agent_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists agent_conversations_user_id_idx on public.agent_conversations(user_id);
create index if not exists agent_conversations_created_at_idx on public.agent_conversations(created_at asc);

-- ------------------------------------------------------------
-- Auto-create profile on Supabase Auth signup
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.tasks enable row level security;
alter table public.time_blocks enable row level security;
alter table public.ai_outputs enable row level security;
alter table public.voice_notes enable row level security;
alter table public.agent_conversations enable row level security;

-- Profiles policies
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile"
on public.profiles for delete
to authenticated
using (auth.uid() = user_id);

-- Opportunities policies
drop policy if exists "Users can read own opportunities" on public.opportunities;
create policy "Users can read own opportunities"
on public.opportunities for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own opportunities" on public.opportunities;
create policy "Users can insert own opportunities"
on public.opportunities for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own opportunities" on public.opportunities;
create policy "Users can update own opportunities"
on public.opportunities for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own opportunities" on public.opportunities;
create policy "Users can delete own opportunities"
on public.opportunities for delete
to authenticated
using (auth.uid() = user_id);

-- Tasks policies
drop policy if exists "Users can read own tasks" on public.tasks;
create policy "Users can read own tasks"
on public.tasks for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own tasks" on public.tasks;
create policy "Users can insert own tasks"
on public.tasks for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own tasks" on public.tasks;
create policy "Users can update own tasks"
on public.tasks for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own tasks" on public.tasks;
create policy "Users can delete own tasks"
on public.tasks for delete
to authenticated
using (auth.uid() = user_id);

-- Time Blocks policies
drop policy if exists "Users can read own time blocks" on public.time_blocks;
create policy "Users can read own time blocks"
on public.time_blocks for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own time blocks" on public.time_blocks;
create policy "Users can insert own time blocks"
on public.time_blocks for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own time blocks" on public.time_blocks;
create policy "Users can update own time blocks"
on public.time_blocks for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own time blocks" on public.time_blocks;
create policy "Users can delete own time blocks"
on public.time_blocks for delete
to authenticated
using (auth.uid() = user_id);

-- AI Outputs policies
drop policy if exists "Users can read own ai outputs" on public.ai_outputs;
create policy "Users can read own ai outputs"
on public.ai_outputs for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own ai outputs" on public.ai_outputs;
create policy "Users can insert own ai outputs"
on public.ai_outputs for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own ai outputs" on public.ai_outputs;
create policy "Users can update own ai outputs"
on public.ai_outputs for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own ai outputs" on public.ai_outputs;
create policy "Users can delete own ai outputs"
on public.ai_outputs for delete
to authenticated
using (auth.uid() = user_id);

-- Voice Notes policies
drop policy if exists "Users can read own voice notes" on public.voice_notes;
create policy "Users can read own voice notes"
on public.voice_notes for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own voice notes" on public.voice_notes;
create policy "Users can insert own voice notes"
on public.voice_notes for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own voice notes" on public.voice_notes;
create policy "Users can update own voice notes"
on public.voice_notes for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own voice notes" on public.voice_notes;
create policy "Users can delete own voice notes"
on public.voice_notes for delete
to authenticated
using (auth.uid() = user_id);

-- Agent Conversations policies
drop policy if exists "Users can read own agent conversations" on public.agent_conversations;
create policy "Users can read own agent conversations"
on public.agent_conversations for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own agent conversations" on public.agent_conversations;
create policy "Users can insert own agent conversations"
on public.agent_conversations for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own agent conversations" on public.agent_conversations;
create policy "Users can update own agent conversations"
on public.agent_conversations for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own agent conversations" on public.agent_conversations;
create policy "Users can delete own agent conversations"
on public.agent_conversations for delete
to authenticated
using (auth.uid() = user_id);
