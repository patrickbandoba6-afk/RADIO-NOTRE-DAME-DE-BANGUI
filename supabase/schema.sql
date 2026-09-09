-- Schéma Supabase (PostgreSQL) pour RADIO NOTRE DAME DE BANGUI
-- Ce schéma couvre les phases 1 à 3 du cahier des charges : programmes,
-- podcasts, prédications, Bible, prière, témoignages, vidéos, événements,
-- communauté, dons et back-office (rôles).
-- À exécuter dans l'éditeur SQL de Supabase, ou via `supabase db push`.

create extension if not exists "uuid-ossp";

-- ==========================================================================
-- Rôles internes (back-office) — section 21 du cahier des charges
-- ==========================================================================
create type role_interne as enum (
  'super_administrateur',
  'direction',
  'producteur',
  'animateur',
  'editeur',
  'moderateur',
  'equipe_priere',
  'comptabilite'
);

create table if not exists profils (
  id uuid primary key references auth.users (id) on delete cascade,
  nom text,
  pays text,
  langue text default 'fr',
  role role_interne,
  cree_le timestamptz not null default now()
);

-- ==========================================================================
-- Stations, émissions et direct (sections 2, 6, 20)
-- ==========================================================================
create table if not exists stations (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  pays text,
  flux_url text not null,
  actif boolean not null default true
);

create table if not exists emissions (
  id uuid primary key default uuid_generate_v4(),
  station_id uuid references stations (id) on delete cascade,
  titre text not null,
  animateur text,
  description text,
  visuel_url text,
  heure_debut time not null,
  heure_fin time not null,
  jours_semaine int[] not null default '{0,1,2,3,4,5,6}'
);

-- ==========================================================================
-- Podcasts et prédications (sections 7, 8)
-- ==========================================================================
create table if not exists podcasts (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  emission_id uuid references emissions (id),
  animateur text,
  theme text,
  langue text not null default 'fr',
  date_publication date not null default current_date,
  duree_secondes int,
  audio_url text not null,
  image_url text,
  transcription text,
  cree_le timestamptz not null default now()
);

create table if not exists predications (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  predicateur text not null,
  serie text,
  theme text,
  verset text,
  langue text not null default 'fr',
  date_publication date not null default current_date,
  duree_secondes int,
  audio_url text,
  video_url text,
  image_url text,
  cree_le timestamptz not null default now()
);

-- ==========================================================================
-- Bible et méditation (section 9)
-- ==========================================================================
create table if not exists versets_du_jour (
  id uuid primary key default uuid_generate_v4(),
  reference text not null,
  texte text not null,
  traduction text not null default 'Louis Segond',
  meditation text,
  date date not null unique default current_date
);

create table if not exists plans_lecture (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  description text,
  nombre_jours int not null
);

create table if not exists plans_lecture_progression (
  utilisateur_id uuid references auth.users (id) on delete cascade,
  plan_id uuid references plans_lecture (id) on delete cascade,
  jour_actuel int not null default 1,
  primary key (utilisateur_id, plan_id)
);

-- ==========================================================================
-- Prière (section 10)
-- ==========================================================================
create type confidentialite_priere as enum ('publique', 'privee', 'anonyme');
create type statut_priere as enum ('recue', 'en_priere', 'traitee');

create table if not exists demandes_priere (
  id uuid primary key default uuid_generate_v4(),
  utilisateur_id uuid references auth.users (id) on delete set null,
  auteur_affiche text,
  texte text not null,
  categorie text,
  confidentialite confidentialite_priere not null default 'publique',
  statut statut_priere not null default 'recue',
  reponse_equipe text,
  cree_le timestamptz not null default now()
);

create table if not exists priere_intercessions (
  demande_id uuid references demandes_priere (id) on delete cascade,
  utilisateur_id uuid references auth.users (id) on delete cascade,
  cree_le timestamptz not null default now(),
  primary key (demande_id, utilisateur_id)
);

-- ==========================================================================
-- Témoignages (section 11)
-- ==========================================================================
create type type_temoignage as enum ('texte', 'audio', 'video');
create type statut_moderation as enum ('en_attente', 'valide', 'rejete');

create table if not exists temoignages (
  id uuid primary key default uuid_generate_v4(),
  utilisateur_id uuid references auth.users (id) on delete set null,
  auteur_affiche text,
  pays text,
  type type_temoignage not null default 'texte',
  contenu text not null,
  categorie text,
  statut statut_moderation not null default 'en_attente',
  cree_le timestamptz not null default now()
);

-- ==========================================================================
-- Vidéo et directs (section 13)
-- ==========================================================================
create table if not exists videos (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  categorie text not null,
  est_en_direct boolean not null default false,
  date_diffusion timestamptz not null default now(),
  duree_secondes int,
  video_url text not null,
  image_url text,
  sous_titres_disponibles boolean not null default false
);

-- ==========================================================================
-- Événements (section 14)
-- ==========================================================================
create type mode_evenement as enum ('en_ligne', 'sur_place');

create table if not exists evenements (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  description text,
  mode mode_evenement not null default 'en_ligne',
  lieu text,
  date_debut timestamptz not null,
  date_fin timestamptz not null,
  fuseau_horaire text not null default 'Africa/Bangui',
  intervenants text[] default '{}',
  programme jsonb default '[]',
  image_url text
);

create table if not exists evenement_inscriptions (
  evenement_id uuid references evenements (id) on delete cascade,
  utilisateur_id uuid references auth.users (id) on delete cascade,
  cree_le timestamptz not null default now(),
  primary key (evenement_id, utilisateur_id)
);

-- ==========================================================================
-- Communauté (section 12)
-- ==========================================================================
create table if not exists groupes_communaute (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  type text not null,
  description text,
  image_url text
);

create table if not exists groupe_membres (
  groupe_id uuid references groupes_communaute (id) on delete cascade,
  utilisateur_id uuid references auth.users (id) on delete cascade,
  cree_le timestamptz not null default now(),
  primary key (groupe_id, utilisateur_id)
);

create table if not exists signalements (
  id uuid primary key default uuid_generate_v4(),
  utilisateur_id uuid references auth.users (id) on delete set null,
  contenu_type text not null,
  contenu_id uuid not null,
  raison text,
  traite boolean not null default false,
  cree_le timestamptz not null default now()
);

-- ==========================================================================
-- Dons (section 16)
-- ==========================================================================
create table if not exists dons (
  id uuid primary key default uuid_generate_v4(),
  utilisateur_id uuid references auth.users (id) on delete set null,
  montant numeric(12, 2) not null,
  devise text not null default 'EUR',
  type text not null default 'ponctuel',
  reference_paiement text,
  cree_le timestamptz not null default now()
);

-- ==========================================================================
-- Favoris et historique multi-appareils (section 17)
-- ==========================================================================
create table if not exists favoris (
  utilisateur_id uuid references auth.users (id) on delete cascade,
  contenu_type text not null,
  contenu_id uuid not null,
  cree_le timestamptz not null default now(),
  primary key (utilisateur_id, contenu_type, contenu_id)
);

create table if not exists historique_ecoute (
  utilisateur_id uuid references auth.users (id) on delete cascade,
  contenu_type text not null,
  contenu_id uuid not null,
  position_secondes int not null default 0,
  mis_a_jour_le timestamptz not null default now(),
  primary key (utilisateur_id, contenu_type, contenu_id)
);

-- ==========================================================================
-- Journal d'audit back-office (section 25)
-- ==========================================================================
create table if not exists journal_audit (
  id uuid primary key default uuid_generate_v4(),
  utilisateur_id uuid references auth.users (id) on delete set null,
  action text not null,
  details jsonb,
  cree_le timestamptz not null default now()
);

-- ==========================================================================
-- Sécurité : Row Level Security
-- ==========================================================================
alter table profils enable row level security;
alter table demandes_priere enable row level security;
alter table priere_intercessions enable row level security;
alter table temoignages enable row level security;
alter table evenement_inscriptions enable row level security;
alter table groupe_membres enable row level security;
alter table signalements enable row level security;
alter table dons enable row level security;
alter table favoris enable row level security;
alter table historique_ecoute enable row level security;

-- Contenu éditorial public en lecture pour tous (invités inclus)
alter table stations enable row level security;
alter table emissions enable row level security;
alter table podcasts enable row level security;
alter table predications enable row level security;
alter table versets_du_jour enable row level security;
alter table videos enable row level security;
alter table evenements enable row level security;
alter table groupes_communaute enable row level security;

create policy "Lecture publique du contenu éditorial" on stations for select using (true);
create policy "Lecture publique du contenu éditorial" on emissions for select using (true);
create policy "Lecture publique du contenu éditorial" on podcasts for select using (true);
create policy "Lecture publique du contenu éditorial" on predications for select using (true);
create policy "Lecture publique du contenu éditorial" on versets_du_jour for select using (true);
create policy "Lecture publique du contenu éditorial" on videos for select using (true);
create policy "Lecture publique du contenu éditorial" on evenements for select using (true);
create policy "Lecture publique du contenu éditorial" on groupes_communaute for select using (true);

-- Un utilisateur ne voit/modifie que ses propres données privées
create policy "Un utilisateur gère son profil" on profils
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Demandes de prière publiques visibles par tous" on demandes_priere
  for select using (confidentialite <> 'privee' or auth.uid() = utilisateur_id);
create policy "Un utilisateur crée ses demandes de prière" on demandes_priere
  for insert with check (auth.uid() = utilisateur_id);

create policy "Un utilisateur intercède librement" on priere_intercessions
  for all using (auth.uid() = utilisateur_id) with check (auth.uid() = utilisateur_id);

create policy "Témoignages validés visibles par tous" on temoignages
  for select using (statut = 'valide' or auth.uid() = utilisateur_id);
create policy "Un utilisateur soumet ses témoignages" on temoignages
  for insert with check (auth.uid() = utilisateur_id);

create policy "Un utilisateur gère ses inscriptions" on evenement_inscriptions
  for all using (auth.uid() = utilisateur_id) with check (auth.uid() = utilisateur_id);

create policy "Un utilisateur gère son appartenance aux groupes" on groupe_membres
  for all using (auth.uid() = utilisateur_id) with check (auth.uid() = utilisateur_id);

create policy "Un utilisateur crée des signalements" on signalements
  for insert with check (auth.uid() = utilisateur_id);

create policy "Un utilisateur voit ses dons" on dons
  for select using (auth.uid() = utilisateur_id);
create policy "Un utilisateur enregistre ses dons" on dons
  for insert with check (auth.uid() = utilisateur_id);

create policy "Un utilisateur gère ses favoris" on favoris
  for all using (auth.uid() = utilisateur_id) with check (auth.uid() = utilisateur_id);

create policy "Un utilisateur gère son historique" on historique_ecoute
  for all using (auth.uid() = utilisateur_id) with check (auth.uid() = utilisateur_id);
