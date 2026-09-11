-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — HISTORIQUE D'ACTIVITÉ DE L'ÉQUIPE
-- ==========================================================================
-- À exécuter APRÈS schema.sql ET schema_editorial.sql. Journalise
-- automatiquement chaque création, modification et suppression de contenu
-- éditorial, avec l'auteur et l'heure — pour que la direction / les super
-- administrateurs puissent voir ce que chaque membre de l'équipe a fait.
-- ==========================================================================

create table if not exists journal_activite (
  id uuid primary key default uuid_generate_v4(),
  acteur_id uuid references auth.users (id) on delete set null,
  action text not null,
  table_cible text not null,
  enregistrement_id uuid,
  titre text,
  cree_le timestamptz not null default now()
);

create index if not exists journal_activite_cree_le_idx on journal_activite (cree_le desc);

alter table journal_activite enable row level security;

drop policy if exists "Lecture de l'activité par les administrateurs" on journal_activite;
create policy "Lecture de l'activité par les administrateurs" on journal_activite
  for select using (est_administrateur());

-- --------------------------------------------------------------------------
-- Fonction générique de journalisation, déclenchée sur chaque table suivie.
-- --------------------------------------------------------------------------
create or replace function journaliser_activite()
returns trigger language plpgsql security definer as $$
declare
  ligne jsonb;
  action_txt text;
begin
  if TG_OP = 'DELETE' then
    ligne := to_jsonb(OLD);
    action_txt := 'suppression';
  elsif TG_OP = 'UPDATE' then
    ligne := to_jsonb(NEW);
    action_txt := 'modification';
  else
    ligne := to_jsonb(NEW);
    action_txt := 'creation';
  end if;

  insert into journal_activite (acteur_id, action, table_cible, enregistrement_id, titre)
  values (
    auth.uid(),
    action_txt,
    TG_TABLE_NAME,
    (ligne->>'id')::uuid,
    coalesce(ligne->>'titre', ligne->>'nom', ligne->>'organisme')
  );

  if TG_OP = 'DELETE' then
    return OLD;
  else
    return NEW;
  end if;
end;
$$;

-- --------------------------------------------------------------------------
-- Branchement sur les principales tables de contenu.
-- --------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'articles', 'annonces', 'episodes', 'emissions', 'homelies', 'interviews',
    'reportages', 'dossiers', 'communiques', 'prieres', 'alertes', 'videos'
  ] loop
    execute format('drop trigger if exists journal_%1$s on %1$s', t);
    execute format(
      'create trigger journal_%1$s after insert or update or delete on %1$s
         for each row execute function journaliser_activite()', t);
  end loop;
end $$;
