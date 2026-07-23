-- AI Film Studio OS — schema inicial do prototipo (nucleo criativo)
-- Rode este arquivo no SQL Editor do seu projeto Supabase (ou via `supabase db push`).

create extension if not exists "pgcrypto";

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Projeto sem título',
  format text, -- filme, curta, série, publicidade, reels, animação, documentário, videoclipe, etc.
  status text not null default 'onboarding', -- onboarding | brief_ready | generating | ready
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists project_briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  conversation jsonb not null default '[]'::jsonb, -- histórico do onboarding [{role, content}]
  brief jsonb, -- brief estruturado final (null enquanto o onboarding não converge)
  is_final boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  doc_type text not null check (doc_type in (
    'logline', 'sinopse', 'tratamento', 'beat_sheet', 'personagens', 'roteiro'
  )),
  content text not null,
  version int not null default 1,
  produced_by text, -- diretor | roteirista | script_doctor | produtor_executivo
  created_at timestamptz not null default now()
);

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  role text not null, -- diretor | roteirista | script_doctor | produtor_executivo
  round int not null,
  summary text,
  created_at timestamptz not null default now()
);

create index if not exists idx_project_briefs_project_id on project_briefs(project_id);
create index if not exists idx_documents_project_id on documents(project_id);
create index if not exists idx_agent_runs_project_id on agent_runs(project_id);

-- Row Level Security: protótipo single-tenant, cada usuário só vê seus próprios projetos.
alter table projects enable row level security;
alter table project_briefs enable row level security;
alter table documents enable row level security;
alter table agent_runs enable row level security;

create policy "projects_owner_all" on projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "project_briefs_owner_all" on project_briefs
  for all using (exists (
    select 1 from projects p where p.id = project_briefs.project_id and p.user_id = auth.uid()
  )) with check (exists (
    select 1 from projects p where p.id = project_briefs.project_id and p.user_id = auth.uid()
  ));

create policy "documents_owner_all" on documents
  for all using (exists (
    select 1 from projects p where p.id = documents.project_id and p.user_id = auth.uid()
  )) with check (exists (
    select 1 from projects p where p.id = documents.project_id and p.user_id = auth.uid()
  ));

create policy "agent_runs_owner_all" on agent_runs
  for all using (exists (
    select 1 from projects p where p.id = agent_runs.project_id and p.user_id = auth.uid()
  )) with check (exists (
    select 1 from projects p where p.id = agent_runs.project_id and p.user_id = auth.uid()
  ));

-- updated_at automático
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at before update on projects
  for each row execute function set_updated_at();

drop trigger if exists trg_project_briefs_updated_at on project_briefs;
create trigger trg_project_briefs_updated_at before update on project_briefs
  for each row execute function set_updated_at();
