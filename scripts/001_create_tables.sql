-- Free Soul (MindCare Flow) Database Schema
-- Mental health monitoring app with gamification

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (references auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  age integer,
  gender text,
  diagnosis text,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Daily check-ins table (main entry point for each day)
create table if not exists public.daily_check_ins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_date date not null,
  completed boolean default false,
  coins_earned integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, check_in_date)
);

alter table public.daily_check_ins enable row level security;

create policy "daily_check_ins_select_own"
  on public.daily_check_ins for select
  using (auth.uid() = user_id);

create policy "daily_check_ins_insert_own"
  on public.daily_check_ins for insert
  with check (auth.uid() = user_id);

create policy "daily_check_ins_update_own"
  on public.daily_check_ins for update
  using (auth.uid() = user_id);

-- Medications tracking
create table if not exists public.medications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_id uuid not null references public.daily_check_ins(id) on delete cascade,
  medication_name text not null,
  dosage text,
  taken boolean not null,
  time_taken timestamp with time zone,
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.medications enable row level security;

create policy "medications_select_own"
  on public.medications for select
  using (auth.uid() = user_id);

create policy "medications_insert_own"
  on public.medications for insert
  with check (auth.uid() = user_id);

create policy "medications_update_own"
  on public.medications for update
  using (auth.uid() = user_id);

-- Sleep tracking
create table if not exists public.sleep_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_id uuid not null references public.daily_check_ins(id) on delete cascade,
  hours_slept numeric(4,2) not null,
  sleep_quality integer not null check (sleep_quality between 1 and 10),
  dreams boolean,
  nightmares boolean,
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.sleep_logs enable row level security;

create policy "sleep_logs_select_own"
  on public.sleep_logs for select
  using (auth.uid() = user_id);

create policy "sleep_logs_insert_own"
  on public.sleep_logs for insert
  with check (auth.uid() = user_id);

create policy "sleep_logs_update_own"
  on public.sleep_logs for update
  using (auth.uid() = user_id);

-- Appetite tracking
create table if not exists public.appetite_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_id uuid not null references public.daily_check_ins(id) on delete cascade,
  appetite_level integer not null check (appetite_level between 1 and 10),
  meals_count integer not null,
  hydration_level integer not null check (hydration_level between 1 and 10),
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.appetite_logs enable row level security;

create policy "appetite_logs_select_own"
  on public.appetite_logs for select
  using (auth.uid() = user_id);

create policy "appetite_logs_insert_own"
  on public.appetite_logs for insert
  with check (auth.uid() = user_id);

create policy "appetite_logs_update_own"
  on public.appetite_logs for update
  using (auth.uid() = user_id);

-- Mood tracking
create table if not exists public.mood_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_id uuid not null references public.daily_check_ins(id) on delete cascade,
  mood_score integer not null check (mood_score between 1 and 10),
  emotions text[], -- array of emotion tags
  energy_level integer not null check (energy_level between 1 and 10),
  stress_level integer not null check (stress_level between 1 and 10),
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.mood_logs enable row level security;

create policy "mood_logs_select_own"
  on public.mood_logs for select
  using (auth.uid() = user_id);

create policy "mood_logs_insert_own"
  on public.mood_logs for insert
  with check (auth.uid() = user_id);

create policy "mood_logs_update_own"
  on public.mood_logs for update
  using (auth.uid() = user_id);

-- Libido tracking
create table if not exists public.libido_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_id uuid not null references public.daily_check_ins(id) on delete cascade,
  libido_level integer not null check (libido_level between 1 and 10),
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.libido_logs enable row level security;

create policy "libido_logs_select_own"
  on public.libido_logs for select
  using (auth.uid() = user_id);

create policy "libido_logs_insert_own"
  on public.libido_logs for insert
  with check (auth.uid() = user_id);

create policy "libido_logs_update_own"
  on public.libido_logs for update
  using (auth.uid() = user_id);

-- Concentration tracking
create table if not exists public.concentration_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_id uuid not null references public.daily_check_ins(id) on delete cascade,
  concentration_level integer not null check (concentration_level between 1 and 10),
  focus_duration_minutes integer,
  distractions_count integer,
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.concentration_logs enable row level security;

create policy "concentration_logs_select_own"
  on public.concentration_logs for select
  using (auth.uid() = user_id);

create policy "concentration_logs_insert_own"
  on public.concentration_logs for insert
  with check (auth.uid() = user_id);

create policy "concentration_logs_update_own"
  on public.concentration_logs for update
  using (auth.uid() = user_id);

-- Impulses tracking
create table if not exists public.impulse_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_id uuid not null references public.daily_check_ins(id) on delete cascade,
  impulse_control_level integer not null check (impulse_control_level between 1 and 10),
  impulse_types text[], -- array of impulse types
  acted_on_impulse boolean,
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.impulse_logs enable row level security;

create policy "impulse_logs_select_own"
  on public.impulse_logs for select
  using (auth.uid() = user_id);

create policy "impulse_logs_insert_own"
  on public.impulse_logs for insert
  with check (auth.uid() = user_id);

create policy "impulse_logs_update_own"
  on public.impulse_logs for update
  using (auth.uid() = user_id);

-- Thoughts tracking
create table if not exists public.thought_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_id uuid not null references public.daily_check_ins(id) on delete cascade,
  intrusive_thoughts boolean,
  racing_thoughts boolean,
  negative_thoughts_intensity integer check (negative_thoughts_intensity between 1 and 10),
  suicidal_ideation boolean,
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.thought_logs enable row level security;

create policy "thought_logs_select_own"
  on public.thought_logs for select
  using (auth.uid() = user_id);

create policy "thought_logs_insert_own"
  on public.thought_logs for insert
  with check (auth.uid() = user_id);

create policy "thought_logs_update_own"
  on public.thought_logs for update
  using (auth.uid() = user_id);

-- Substances tracking
create table if not exists public.substance_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_id uuid not null references public.daily_check_ins(id) on delete cascade,
  substance_type text not null,
  amount text,
  time_consumed timestamp with time zone,
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.substance_logs enable row level security;

create policy "substance_logs_select_own"
  on public.substance_logs for select
  using (auth.uid() = user_id);

create policy "substance_logs_insert_own"
  on public.substance_logs for insert
  with check (auth.uid() = user_id);

create policy "substance_logs_update_own"
  on public.substance_logs for update
  using (auth.uid() = user_id);

-- Gamification: User coins/points
create table if not exists public.user_coins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_coins integer default 0,
  coins_spent integer default 0,
  current_balance integer default 0,
  updated_at timestamp with time zone default now()
);

alter table public.user_coins enable row level security;

create policy "user_coins_select_own"
  on public.user_coins for select
  using (auth.uid() = user_id);

create policy "user_coins_insert_own"
  on public.user_coins for insert
  with check (auth.uid() = user_id);

create policy "user_coins_update_own"
  on public.user_coins for update
  using (auth.uid() = user_id);

-- Achievements
create table if not exists public.achievements (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text not null,
  icon text,
  coins_reward integer default 0,
  created_at timestamp with time zone default now()
);

-- User achievements (many-to-many)
create table if not exists public.user_achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamp with time zone default now(),
  unique(user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "user_achievements_select_own"
  on public.user_achievements for select
  using (auth.uid() = user_id);

create policy "user_achievements_insert_own"
  on public.user_achievements for insert
  with check (auth.uid() = user_id);

-- Games played tracking
create table if not exists public.games_played (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_type text not null,
  score integer,
  coins_earned integer default 0,
  played_at timestamp with time zone default now()
);

alter table public.games_played enable row level security;

create policy "games_played_select_own"
  on public.games_played for select
  using (auth.uid() = user_id);

create policy "games_played_insert_own"
  on public.games_played for insert
  with check (auth.uid() = user_id);

-- SOS contacts
create table if not exists public.sos_contacts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_name text not null,
  phone_number text not null,
  relationship text,
  is_primary boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.sos_contacts enable row level security;

create policy "sos_contacts_select_own"
  on public.sos_contacts for select
  using (auth.uid() = user_id);

create policy "sos_contacts_insert_own"
  on public.sos_contacts for insert
  with check (auth.uid() = user_id);

create policy "sos_contacts_update_own"
  on public.sos_contacts for update
  using (auth.uid() = user_id);

create policy "sos_contacts_delete_own"
  on public.sos_contacts for delete
  using (auth.uid() = user_id);

-- Data sharing permissions (for clinicians)
create table if not exists public.data_sharing (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  clinician_email text not null,
  permission_granted boolean default false,
  granted_at timestamp with time zone,
  revoked_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table public.data_sharing enable row level security;

create policy "data_sharing_select_own"
  on public.data_sharing for select
  using (auth.uid() = user_id);

create policy "data_sharing_insert_own"
  on public.data_sharing for insert
  with check (auth.uid() = user_id);

create policy "data_sharing_update_own"
  on public.data_sharing for update
  using (auth.uid() = user_id);

-- Create indexes for better query performance
create index if not exists idx_daily_check_ins_user_date on public.daily_check_ins(user_id, check_in_date desc);
create index if not exists idx_medications_check_in on public.medications(check_in_id);
create index if not exists idx_sleep_logs_check_in on public.sleep_logs(check_in_id);
create index if not exists idx_mood_logs_check_in on public.mood_logs(check_in_id);
create index if not exists idx_games_played_user on public.games_played(user_id, played_at desc);
