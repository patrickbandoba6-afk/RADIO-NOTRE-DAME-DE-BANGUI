-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — BIBLE COMPLÈTE (PLUSIEURS TRADUCTIONS)
-- ==========================================================================
-- Chaque livre/chapitre/verset est stocké une fois par traduction, pour que
-- l'auditeur choisisse lui-même la version qu'il lit ou écoute. `canon`
-- distingue : 'commun' (les 66 livres partagés par catholiques et
-- protestants), 'deuterocanonique' (Tobie, Judith, Sagesse, Siracide,
-- Baruch, 1-2 Maccabées — catholiques, absents des bibles protestantes) et
-- 'annexe' (3-4 Maccabées : hors canon catholique, affichés à part et
-- clairement étiquetés comme tels). `audio_url` permet à l'équipe d'ajouter
-- un enregistrement audio par chapitre quand il existe. Idempotent.
-- ==========================================================================

create table if not exists bible_livres (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  nom text not null,
  testament text not null check (testament in ('ancien', 'nouveau')),
  canon text not null default 'commun' check (canon in ('commun', 'deuterocanonique', 'annexe')),
  ordre int not null,
  nombre_chapitres int not null
);

create table if not exists bible_versets (
  id uuid primary key default uuid_generate_v4(),
  livre_code text not null references bible_livres (code) on delete cascade,
  chapitre int not null,
  verset int not null,
  traduction text not null,
  texte text not null,
  unique (livre_code, chapitre, verset, traduction)
);

create table if not exists bible_audio_chapitres (
  id uuid primary key default uuid_generate_v4(),
  livre_code text not null references bible_livres (code) on delete cascade,
  chapitre int not null,
  traduction text not null,
  audio_url text not null,
  unique (livre_code, chapitre, traduction)
);

create index if not exists bible_versets_lookup on bible_versets (livre_code, chapitre, traduction);

alter table bible_livres enable row level security;
alter table bible_versets enable row level security;
alter table bible_audio_chapitres enable row level security;

drop policy if exists "Lecture publique de la Bible" on bible_livres;
create policy "Lecture publique de la Bible" on bible_livres for select using (true);

drop policy if exists "Lecture publique de la Bible" on bible_versets;
create policy "Lecture publique de la Bible" on bible_versets for select using (true);

drop policy if exists "Lecture publique de la Bible" on bible_audio_chapitres;
create policy "Lecture publique de la Bible" on bible_audio_chapitres for select using (true);

drop policy if exists "Écriture équipe interne" on bible_livres;
create policy "Écriture équipe interne" on bible_livres
  for all using (est_membre_equipe()) with check (est_membre_equipe());

drop policy if exists "Écriture équipe interne" on bible_versets;
create policy "Écriture équipe interne" on bible_versets
  for all using (est_membre_equipe()) with check (est_membre_equipe());

drop policy if exists "Écriture équipe interne" on bible_audio_chapitres;
create policy "Écriture équipe interne" on bible_audio_chapitres
  for all using (est_membre_equipe()) with check (est_membre_equipe());
