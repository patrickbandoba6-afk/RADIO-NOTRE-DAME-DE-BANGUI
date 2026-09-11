-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — STATISTIQUES D'UTILISATION
-- ==========================================================================
-- À exécuter APRÈS schema.sql ET schema_editorial.sql (dépend de la fonction
-- est_membre_equipe() définie dans ce dernier). Journal léger des ouvertures
-- de l'application
-- (pas de données personnelles : ni identifiant, ni position précise — juste
-- le pays déduit de la langue/région du téléphone, à titre indicatif).
-- ==========================================================================

create table if not exists visites_app (
  id uuid primary key default uuid_generate_v4(),
  cree_le timestamptz not null default now(),
  pays text,
  plateforme text,
  langue text
);

alter table visites_app enable row level security;

-- N'importe qui (y compris en mode invité) peut enregistrer une visite.
create policy "Enregistrement public d'une visite" on visites_app
  for insert with check (true);

-- Seule l'équipe interne peut consulter les statistiques.
create policy "Lecture des statistiques par l'équipe" on visites_app
  for select using (est_membre_equipe());
