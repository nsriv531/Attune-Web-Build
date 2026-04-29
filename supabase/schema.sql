-- -- supabase/schema.sql
-- -- Run this in the Supabase SQL editor to set up the database.

-- -- ─── Extensions ────────────────────────────────────────────────────────────
-- create extension if not exists "uuid-ossp";
-- create extension if not exists "vector";  -- for pgvector reflection embeddings

-- -- ─── Profiles ──────────────────────────────────────────────────────────────
-- create table if not exists public.profiles (
--   id            uuid primary key references auth.users(id) on delete cascade,
--   name          text not null default 'Student',
--   streak_days   int  not null default 0,
--   total_xp      int  not null default 0,
--   avatar_level  int  not null default 1,
--   total_sessions int not null default 0,
--   joined_at     timestamptz not null default now(),
--   updated_at    timestamptz not null default now()
-- );

-- alter table public.profiles enable row level security;

-- create policy "Users can read own profile"
--   on public.profiles for select
--   using (auth.uid() = id);

-- create policy "Users can update own profile"
--   on public.profiles for update
--   using (auth.uid() = id);

-- -- Auto-create profile on signup
-- create or replace function public.handle_new_user()
-- returns trigger language plpgsql security definer as $$
-- begin
--   insert into public.profiles (id, name)
--   values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Student'));
--   return new;
-- end;
-- $$;

-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();

-- -- ─── Subjects ──────────────────────────────────────────────────────────────
-- create table if not exists public.subjects (
--   id         uuid primary key default uuid_generate_v4(),
--   user_id    uuid references public.profiles(id) on delete cascade,
--   name       text not null,
--   color      text not null default '#a78bfa',
--   created_at timestamptz not null default now()
-- );

-- alter table public.subjects enable row level security;

-- create policy "Users can manage own subjects"
--   on public.subjects for all
--   using (auth.uid() = user_id);

-- -- ─── Sessions ──────────────────────────────────────────────────────────────
-- create table if not exists public.sessions (
--   id                uuid primary key default uuid_generate_v4(),
--   user_id           uuid references public.profiles(id) on delete cascade,
--   subject           text not null,
--   subject_id        text,
--   duration_minutes  int  not null,
--   started_at        timestamptz not null,
--   ended_at          timestamptz,
--   focus_score       int  not null default 0 check (focus_score between 0 and 100),
--   distraction_count int  not null default 0,
--   feeling           text check (feeling in ('solid', 'good', 'rough')),
--   reflection_note   text,
--   xp_earned         int  not null default 0,
--   completed         boolean not null default false,
--   created_at        timestamptz not null default now()
-- );

-- alter table public.sessions enable row level security;

-- create policy "Users can manage own sessions"
--   on public.sessions for all
--   using (auth.uid() = user_id);

-- -- Index for fast timeline queries
-- create index if not exists idx_sessions_user_started
--   on public.sessions (user_id, started_at desc);

-- -- ─── Distraction events ────────────────────────────────────────────────────
-- create table if not exists public.distraction_events (
--   id               uuid primary key default uuid_generate_v4(),
--   session_id       uuid references public.sessions(id) on delete cascade,
--   user_id          uuid references public.profiles(id) on delete cascade,
--   type             text not null check (type in ('app-switch', 'idle', 'scroll-burst')),
--   duration_seconds int  not null,
--   occurred_at      timestamptz not null default now()
-- );

-- alter table public.distraction_events enable row level security;

-- create policy "Users can manage own distraction events"
--   on public.distraction_events for all
--   using (auth.uid() = user_id);

-- -- ─── Reflection embeddings (pgvector) ──────────────────────────────────────
-- create table if not exists public.reflection_embeddings (
--   id          uuid primary key default uuid_generate_v4(),
--   session_id  uuid references public.sessions(id) on delete cascade,
--   user_id     uuid references public.profiles(id) on delete cascade,
--   content     text not null,
--   embedding   vector(1536),  -- OpenAI / Anthropic text-embedding-3-small dimension
--   created_at  timestamptz not null default now()
-- );

-- alter table public.reflection_embeddings enable row level security;

-- create policy "Users can manage own embeddings"
--   on public.reflection_embeddings for all
--   using (auth.uid() = user_id);

-- -- HNSW index for fast similarity search
-- create index if not exists idx_reflection_embeddings_hnsw
--   on public.reflection_embeddings
--   using hnsw (embedding vector_cosine_ops);

-- -- ─── Streaks (denormalised for fast reads) ─────────────────────────────────
-- create table if not exists public.streaks (
--   user_id        uuid primary key references public.profiles(id) on delete cascade,
--   current_streak int not null default 0,
--   longest_streak int not null default 0,
--   last_session_date date,
--   updated_at     timestamptz not null default now()
-- );

-- alter table public.streaks enable row level security;

-- create policy "Users can manage own streaks"
--   on public.streaks for all
--   using (auth.uid() = user_id);

-- -- ─── Realtime ──────────────────────────────────────────────────────────────
-- -- Enable realtime on sessions so the client gets AI suggestions pushed back
-- alter publication supabase_realtime add table public.sessions;
