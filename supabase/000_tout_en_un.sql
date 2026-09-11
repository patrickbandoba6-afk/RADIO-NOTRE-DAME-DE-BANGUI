-- ==========================================================================
-- SCRIPT COMBINÉ — À EXÉCUTER EN UNE SEULE FOIS DANS L'ÉDITEUR SQL SUPABASE
-- Ordre : schema.sql -> schema_editorial.sql -> schema_avatars.sql ->
-- schema_stats.sql -> schema_activite.sql -> schema_permissions.sql ->
-- schema_direction_gestion_equipe.sql -> schema_role_attribue_par.sql ->
-- schema_services_taches.sql -> schema_planification.sql ->
-- schema_securite_profils.sql -> schema_fichiers_partages.sql
-- Idempotent dans son ensemble : peut être ré-exécuté sans risque.
-- ==========================================================================

-- ==========================================================================
-- FIN précédent / DÉBUT schema.sql
-- ==========================================================================
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

-- ==========================================================================
-- FIN précédent / DÉBUT schema_editorial.sql
-- ==========================================================================
-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — MODULE ÉDITORIAL
-- ==========================================================================
-- Ce fichier complète `schema.sql` (à exécuter APRÈS lui). Il ajoute les
-- tables du module éditorial : actualités, annonces, agenda, catalogue des
-- émissions, grille des programmes, spiritualité, dossiers, annuaires,
-- médias, notifications et alertes.
--
-- Aucune table existante n'est supprimée ni renommée.
-- ==========================================================================

create extension if not exists "uuid-ossp";

-- --------------------------------------------------------------------------
-- Types communs
-- --------------------------------------------------------------------------
do $$ begin
  create type statut_publication as enum (
    'brouillon', 'en_attente', 'programme', 'publie', 'depublie', 'archive'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type rubrique_editoriale as enum (
    'actualites', 'bangui', 'rca', 'afrique', 'monde', 'vie_eglise',
    'spiritualite', 'jeunesse', 'famille', 'solidarite', 'societe',
    'culture', 'interviews', 'reportages', 'communiques', 'dossiers'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type type_media as enum ('image', 'audio', 'video', 'document');
exception when duplicate_object then null; end $$;

-- --------------------------------------------------------------------------
-- Bibliothèque média centralisée (section 49)
-- --------------------------------------------------------------------------
create table if not exists medias (
  id uuid primary key default uuid_generate_v4(),
  type type_media not null default 'image',
  url text not null,
  chemin_stockage text,
  legende text,
  auteur text,
  largeur int,
  hauteur int,
  taille_octets bigint,
  cree_par uuid references auth.users (id) on delete set null,
  cree_le timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- Catégories, tags, lieux (sections 42, 66)
-- --------------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  slug text not null unique,
  rubrique rubrique_editoriale not null default 'actualites',
  couleur text,
  ordre int not null default 0
);

create table if not exists tags (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  slug text not null unique
);

create table if not exists localisations (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  type text not null default 'ville',
  ville text,
  quartier text,
  arrondissement text,
  pays text not null default 'République centrafricaine',
  latitude double precision,
  longitude double precision
);

-- --------------------------------------------------------------------------
-- Personnes / intervenants (section 41)
-- --------------------------------------------------------------------------
create table if not exists personnes (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  role text,
  photo_url text,
  biographie text,
  email text,
  telephone text,
  cree_le timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- Annuaires : diocèses, paroisses, organisations (sections 38, 39, 40)
-- --------------------------------------------------------------------------
create table if not exists dioceses (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  territoire text,
  eveque text,
  adresse text,
  telephone text,
  email text,
  image_url text,
  cree_le timestamptz not null default now()
);

create table if not exists paroisses (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  diocese_id uuid references dioceses (id) on delete set null,
  description text,
  image_url text,
  adresse text,
  quartier text,
  arrondissement text,
  ville text not null default 'Bangui',
  telephone text,
  email text,
  latitude double precision,
  longitude double precision,
  horaires_messes jsonb not null default '[]',
  cree_le timestamptz not null default now()
);

create table if not exists organisations (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  type text not null default 'association',
  description text,
  image_url text,
  contact text,
  ville text,
  cree_le timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- ACTUALITÉS (sections 3 à 8)
-- --------------------------------------------------------------------------
create table if not exists articles (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  titre text not null,
  sous_titre text,
  resume text,
  contenu text,
  image_url text,
  video_url text,
  audio_url text,
  auteur text,
  auteur_id uuid references auth.users (id) on delete set null,
  rubrique rubrique_editoriale not null default 'actualites',
  categorie_id uuid references categories (id) on delete set null,
  localisation_id uuid references localisations (id) on delete set null,
  lieu text,
  paroisse_id uuid references paroisses (id) on delete set null,
  diocese_id uuid references dioceses (id) on delete set null,
  langue text not null default 'fr',
  statut statut_publication not null default 'brouillon',
  date_publication timestamptz not null default now(),
  date_evenement timestamptz,
  a_la_une boolean not null default false,
  ordre_une int not null default 0,
  urgent boolean not null default false,
  sponsorise boolean not null default false,
  partage_autorise boolean not null default true,
  nombre_vues int not null default 0,
  source text,
  source_url text,
  seo_titre text,
  seo_description text,
  mots_cles text[] default '{}',
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

create index if not exists articles_statut_date_idx
  on articles (statut, date_publication desc);
create index if not exists articles_rubrique_idx on articles (rubrique);

create table if not exists article_tags (
  article_id uuid references articles (id) on delete cascade,
  tag_id uuid references tags (id) on delete cascade,
  primary key (article_id, tag_id)
);

create table if not exists article_medias (
  article_id uuid references articles (id) on delete cascade,
  media_id uuid references medias (id) on delete cascade,
  ordre int not null default 0,
  primary key (article_id, media_id)
);

-- Contenus liés entre eux (section 57)
create table if not exists contenus_lies (
  source_type text not null,
  source_id uuid not null,
  cible_type text not null,
  cible_id uuid not null,
  primary key (source_type, source_id, cible_type, cible_id)
);

-- --------------------------------------------------------------------------
-- ANNONCES (section 9)
-- --------------------------------------------------------------------------
create table if not exists annonces (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  description text,
  image_url text,
  organisateur text,
  organisation_id uuid references organisations (id) on delete set null,
  paroisse_id uuid references paroisses (id) on delete set null,
  categorie text not null default 'communautaire',
  date_debut timestamptz not null default now(),
  date_fin timestamptz,
  lieu text,
  adresse text,
  latitude double precision,
  longitude double precision,
  telephone text,
  email text,
  site_web text,
  prix text,
  lien_inscription text,
  pieces_jointes jsonb not null default '[]',
  urgente boolean not null default false,
  statut statut_publication not null default 'brouillon',
  date_publication timestamptz not null default now(),
  cree_le timestamptz not null default now()
);

create index if not exists annonces_statut_date_idx
  on annonces (statut, date_debut);

create table if not exists annonce_participants (
  annonce_id uuid references annonces (id) on delete cascade,
  utilisateur_id uuid references auth.users (id) on delete cascade,
  cree_le timestamptz not null default now(),
  primary key (annonce_id, utilisateur_id)
);

-- --------------------------------------------------------------------------
-- AGENDA / ÉVÉNEMENTS — complète la table `evenements` de schema.sql
-- --------------------------------------------------------------------------
alter table evenements add column if not exists categorie_agenda text default 'autre';
alter table evenements add column if not exists statut statut_publication not null default 'publie';
alter table evenements add column if not exists organisateur text;
alter table evenements add column if not exists adresse text;
alter table evenements add column if not exists latitude double precision;
alter table evenements add column if not exists longitude double precision;
alter table evenements add column if not exists contact text;
alter table evenements add column if not exists lien_inscription text;
alter table evenements add column if not exists diffuse_en_direct boolean not null default false;
alter table evenements add column if not exists replay_url text;
alter table evenements add column if not exists paroisse_id uuid references paroisses (id) on delete set null;

create table if not exists evenement_rappels (
  evenement_id uuid references evenements (id) on delete cascade,
  utilisateur_id uuid references auth.users (id) on delete cascade,
  minutes_avant int not null default 60,
  primary key (evenement_id, utilisateur_id, minutes_avant)
);

-- --------------------------------------------------------------------------
-- ÉMISSIONS ET GRILLE DES PROGRAMMES (sections 12, 13)
-- --------------------------------------------------------------------------
alter table emissions add column if not exists slug text;
alter table emissions add column if not exists categorie text;
alter table emissions add column if not exists chroniqueurs text[] default '{}';
alter table emissions add column if not exists frequence_diffusion text;
alter table emissions add column if not exists statut statut_publication not null default 'publie';

create table if not exists episodes (
  id uuid primary key default uuid_generate_v4(),
  emission_id uuid references emissions (id) on delete cascade,
  titre text not null,
  description text,
  image_url text,
  audio_url text not null,
  duree_secondes int,
  date_publication timestamptz not null default now(),
  animateur text,
  invites text[] default '{}',
  categorie text,
  numero_episode int,
  telechargement_autorise boolean not null default true,
  statut statut_publication not null default 'publie',
  cree_le timestamptz not null default now()
);

create index if not exists episodes_emission_date_idx
  on episodes (emission_id, date_publication desc);

-- Créneaux de la grille (permet des exceptions par date)
create table if not exists programmes_grille (
  id uuid primary key default uuid_generate_v4(),
  emission_id uuid references emissions (id) on delete cascade,
  jour_semaine int not null check (jour_semaine between 0 and 6),
  heure_debut time not null,
  heure_fin time not null,
  date_exception date,
  actif boolean not null default true
);

-- --------------------------------------------------------------------------
-- SPIRITUALITÉ (sections 15 à 18)
-- --------------------------------------------------------------------------
create table if not exists prieres (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  type text not null default 'quotidienne',
  texte text,
  audio_url text,
  video_url text,
  image_url text,
  duree_secondes int,
  auteur text,
  statut statut_publication not null default 'publie',
  cree_le timestamptz not null default now()
);

create table if not exists evangiles_du_jour (
  id uuid primary key default uuid_generate_v4(),
  date date not null unique default current_date,
  saint_du_jour text,
  premiere_lecture jsonb,
  psaume jsonb,
  deuxieme_lecture jsonb,
  evangile jsonb not null,
  meditation text,
  commentaire text,
  audio_url text,
  statut statut_publication not null default 'publie'
);

create table if not exists homelies (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  celebration text,
  celebrant text,
  date_celebration timestamptz not null default now(),
  lieu text,
  texte text,
  audio_url text,
  video_url text,
  image_url text,
  duree_secondes int,
  transcription text,
  statut statut_publication not null default 'publie',
  cree_le timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- INTERVIEWS, REPORTAGES, DOSSIERS, COMMUNIQUÉS (sections 20 à 22, 36)
-- --------------------------------------------------------------------------
create table if not exists interviews (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  invite text not null,
  fonction_invite text,
  resume text,
  contenu text,
  image_url text,
  audio_url text,
  video_url text,
  date_publication timestamptz not null default now(),
  format text not null default 'audio',
  statut statut_publication not null default 'publie',
  cree_le timestamptz not null default now()
);

create table if not exists reportages (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  type text not null default 'terrain',
  journaliste text,
  lieu text,
  resume text,
  contenu text,
  image_url text,
  audio_url text,
  video_url text,
  date_publication timestamptz not null default now(),
  statut statut_publication not null default 'publie',
  cree_le timestamptz not null default now()
);

create table if not exists dossiers (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  slug text not null unique,
  presentation text,
  image_url text,
  date_debut timestamptz not null default now(),
  date_fin timestamptz,
  actif boolean not null default true,
  statut statut_publication not null default 'publie',
  cree_le timestamptz not null default now()
);

create table if not exists dossier_contenus (
  dossier_id uuid references dossiers (id) on delete cascade,
  contenu_type text not null,
  contenu_id uuid not null,
  ordre int not null default 0,
  primary key (dossier_id, contenu_type, contenu_id)
);

create table if not exists communiques (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  organisme text not null,
  type_organisme text not null default 'diocese',
  contenu text,
  document_url text,
  date_publication timestamptz not null default now(),
  statut statut_publication not null default 'publie',
  cree_le timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- GALERIES PHOTOS (section 37)
-- --------------------------------------------------------------------------
create table if not exists galeries (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  description text,
  contenu_type text,
  contenu_id uuid,
  statut statut_publication not null default 'publie',
  cree_le timestamptz not null default now()
);

create table if not exists galerie_medias (
  galerie_id uuid references galeries (id) on delete cascade,
  media_id uuid references medias (id) on delete cascade,
  ordre int not null default 0,
  primary key (galerie_id, media_id)
);

-- --------------------------------------------------------------------------
-- NOTIFICATIONS, ALERTES, NEWSLETTER (sections 32, 33, 63)
-- --------------------------------------------------------------------------
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  message text,
  categorie text not null default 'actualites',
  contenu_type text,
  contenu_id uuid,
  envoyee_le timestamptz,
  programmee_le timestamptz,
  cree_par uuid references auth.users (id) on delete set null,
  cree_le timestamptz not null default now()
);

create table if not exists alertes (
  id uuid primary key default uuid_generate_v4(),
  type text not null default 'info',
  titre text not null,
  message text not null,
  contenu_type text,
  contenu_id uuid,
  active boolean not null default true,
  expire_le timestamptz,
  cree_le timestamptz not null default now()
);

create table if not exists jetons_push (
  utilisateur_id uuid references auth.users (id) on delete cascade,
  jeton text not null,
  plateforme text,
  mis_a_jour_le timestamptz not null default now(),
  primary key (utilisateur_id, jeton)
);

create table if not exists abonnements_newsletter (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  utilisateur_id uuid references auth.users (id) on delete set null,
  actif boolean not null default true,
  cree_le timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- HISTORIQUE DE CONSULTATION (section 30)
-- --------------------------------------------------------------------------
create table if not exists historique_consultation (
  utilisateur_id uuid references auth.users (id) on delete cascade,
  contenu_type text not null,
  contenu_id uuid not null,
  titre text,
  image_url text,
  consulte_le timestamptz not null default now(),
  primary key (utilisateur_id, contenu_type, contenu_id)
);

-- --------------------------------------------------------------------------
-- Publication programmée (section 44) — bascule automatique
-- --------------------------------------------------------------------------
create or replace function publier_contenus_programmes()
returns void language plpgsql security definer as $$
begin
  update articles set statut = 'publie'
   where statut = 'programme' and date_publication <= now();
  update annonces set statut = 'publie'
   where statut = 'programme' and date_publication <= now();
  update episodes set statut = 'publie'
   where statut = 'programme' and date_publication <= now();
end;
$$;

-- Mise à jour automatique de `modifie_le`
create or replace function touch_modifie_le()
returns trigger language plpgsql as $$
begin
  new.modifie_le = now();
  return new;
end;
$$;

drop trigger if exists articles_touch on articles;
create trigger articles_touch before update on articles
  for each row execute function touch_modifie_le();

-- --------------------------------------------------------------------------
-- Rôles internes : qui peut écrire ? (sections 45, 46)
-- --------------------------------------------------------------------------
create or replace function est_membre_equipe()
returns boolean language sql stable as $$
  select exists (
    select 1 from profils
     where profils.id = auth.uid() and profils.role is not null
  );
$$;

create or replace function est_administrateur()
returns boolean language sql stable as $$
  select exists (
    select 1 from profils
     where profils.id = auth.uid()
       and profils.role in ('super_administrateur', 'direction')
  );
$$;

-- --------------------------------------------------------------------------
-- Row Level Security
-- --------------------------------------------------------------------------
alter table medias enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table localisations enable row level security;
alter table personnes enable row level security;
alter table dioceses enable row level security;
alter table paroisses enable row level security;
alter table organisations enable row level security;
alter table articles enable row level security;
alter table article_tags enable row level security;
alter table article_medias enable row level security;
alter table contenus_lies enable row level security;
alter table annonces enable row level security;
alter table annonce_participants enable row level security;
alter table evenement_rappels enable row level security;
alter table episodes enable row level security;
alter table programmes_grille enable row level security;
alter table prieres enable row level security;
alter table evangiles_du_jour enable row level security;
alter table homelies enable row level security;
alter table interviews enable row level security;
alter table reportages enable row level security;
alter table dossiers enable row level security;
alter table dossier_contenus enable row level security;
alter table communiques enable row level security;
alter table galeries enable row level security;
alter table galerie_medias enable row level security;
alter table notifications enable row level security;
alter table alertes enable row level security;
alter table jetons_push enable row level security;
alter table abonnements_newsletter enable row level security;
alter table historique_consultation enable row level security;

-- Lecture publique du contenu PUBLIÉ uniquement
do $$
declare t text;
begin
  foreach t in array array[
    'articles', 'annonces', 'episodes', 'prieres', 'evangiles_du_jour',
    'homelies', 'interviews', 'reportages', 'dossiers', 'communiques', 'galeries'
  ] loop
    execute format(
      'drop policy if exists "Lecture publique du contenu publié" on %I', t);
    execute format(
      'create policy "Lecture publique du contenu publié" on %I
         for select using (statut = ''publie'' or est_membre_equipe())', t);
  end loop;
end $$;

-- Référentiels et annuaires : lecture publique totale
do $$
declare t text;
begin
  foreach t in array array[
    'medias', 'categories', 'tags', 'localisations', 'personnes', 'dioceses',
    'paroisses', 'organisations', 'programmes_grille', 'article_tags',
    'article_medias', 'contenus_lies', 'dossier_contenus', 'galerie_medias'
  ] loop
    execute format('drop policy if exists "Lecture publique" on %I', t);
    execute format(
      'create policy "Lecture publique" on %I for select using (true)', t);
  end loop;
end $$;

-- Alertes actives visibles par tous
drop policy if exists "Alertes actives publiques" on alertes;
create policy "Alertes actives publiques" on alertes
  for select using (active and (expire_le is null or expire_le > now()));

-- Écriture réservée à l'équipe interne
do $$
declare t text;
begin
  foreach t in array array[
    'medias', 'categories', 'tags', 'localisations', 'personnes', 'dioceses',
    'paroisses', 'organisations', 'articles', 'article_tags', 'article_medias',
    'contenus_lies', 'annonces', 'episodes', 'programmes_grille', 'prieres',
    'evangiles_du_jour', 'homelies', 'interviews', 'reportages', 'dossiers',
    'dossier_contenus', 'communiques', 'galeries', 'galerie_medias',
    'notifications', 'alertes'
  ] loop
    execute format('drop policy if exists "Écriture équipe interne" on %I', t);
    execute format(
      'create policy "Écriture équipe interne" on %I
         for all using (est_membre_equipe()) with check (est_membre_equipe())', t);
  end loop;
end $$;

-- Données personnelles de l'utilisateur
drop policy if exists "Un utilisateur gère ses participations" on annonce_participants;
create policy "Un utilisateur gère ses participations" on annonce_participants
  for all using (auth.uid() = utilisateur_id) with check (auth.uid() = utilisateur_id);

drop policy if exists "Un utilisateur gère ses rappels" on evenement_rappels;
create policy "Un utilisateur gère ses rappels" on evenement_rappels
  for all using (auth.uid() = utilisateur_id) with check (auth.uid() = utilisateur_id);

drop policy if exists "Un utilisateur gère ses jetons push" on jetons_push;
create policy "Un utilisateur gère ses jetons push" on jetons_push
  for all using (auth.uid() = utilisateur_id) with check (auth.uid() = utilisateur_id);

drop policy if exists "Un utilisateur gère son historique de lecture" on historique_consultation;
create policy "Un utilisateur gère son historique de lecture" on historique_consultation
  for all using (auth.uid() = utilisateur_id) with check (auth.uid() = utilisateur_id);

drop policy if exists "Inscription newsletter ouverte" on abonnements_newsletter;
create policy "Inscription newsletter ouverte" on abonnements_newsletter
  for insert with check (true);
drop policy if exists "Lecture newsletter équipe" on abonnements_newsletter;
create policy "Lecture newsletter équipe" on abonnements_newsletter
  for select using (est_membre_equipe());

-- Notifications : lecture publique de l'historique envoyé
drop policy if exists "Lecture publique des notifications envoyées" on notifications;
create policy "Lecture publique des notifications envoyées" on notifications
  for select using (envoyee_le is not null or est_membre_equipe());

-- --------------------------------------------------------------------------
-- Stockage des images (bucket public)
-- --------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('contenu-images', 'contenu-images', true)
on conflict (id) do nothing;

drop policy if exists "Images publiques en lecture" on storage.objects;
create policy "Images publiques en lecture" on storage.objects
  for select using (bucket_id = 'contenu-images');

drop policy if exists "Upload images équipe interne" on storage.objects;
create policy "Upload images équipe interne" on storage.objects
  for insert with check (bucket_id = 'contenu-images' and est_membre_equipe());

drop policy if exists "Gestion images équipe interne" on storage.objects;
create policy "Gestion images équipe interne" on storage.objects
  for update using (bucket_id = 'contenu-images' and est_membre_equipe());

drop policy if exists "Suppression images équipe interne" on storage.objects;
create policy "Suppression images équipe interne" on storage.objects
  for delete using (bucket_id = 'contenu-images' and est_membre_equipe());

-- ==========================================================================
-- FIN précédent / DÉBUT schema_avatars.sql
-- ==========================================================================
-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — PHOTOS DE PROFIL
-- ==========================================================================
-- À exécuter APRÈS schema.sql. Crée le bucket public "avatars" : chaque
-- utilisateur ne peut écrire que dans son propre dossier (préfixé par son
-- auth.uid()), mais tout le monde peut lire les avatars (affichage public).
-- ==========================================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Lecture publique des avatars" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Un utilisateur ajoute son propre avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Un utilisateur modifie son propre avatar" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Un utilisateur supprime son propre avatar" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ==========================================================================
-- FIN précédent / DÉBUT schema_stats.sql
-- ==========================================================================
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

-- ==========================================================================
-- FIN précédent / DÉBUT schema_activite.sql
-- ==========================================================================
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

-- ==========================================================================
-- FIN précédent / DÉBUT schema_permissions.sql
-- ==========================================================================
-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — RÔLES ET PERMISSIONS GRANULAIRES
-- ==========================================================================
-- À exécuter APRÈS schema.sql, schema_editorial.sql et schema_activite.sql.
--
-- Ne remplace PAS `profils.role` (qui reste la seule affectation de rôle
-- d'un utilisateur — rien de cassé côté authentification existante).
-- Ajoute une couche de permissions granulaires par rôle : chaque action
-- sensible (articles.publish, finance.view, users.delete...) est vérifiable
-- individuellement, côté base de données ET côté serveur Next.js — jamais
-- seulement "if role === ...".
--
-- Idempotent : peut être ré-exécuté sans dupliquer ni supprimer de données.
-- ==========================================================================

-- NOTE : sur ce projet, les tables roles/permissions/role_permissions
-- existaient déjà (créées hors de nos scripts) avec les colonnes slug/name
-- ci-dessous — les `create table if not exists` sont donc des no-op ici et
-- ne font que documenter la structure pour une toute nouvelle installation.
create table if not exists roles (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  description text,
  is_system_role boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists permissions (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  module text not null,
  action text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists role_permissions (
  role_id uuid not null references roles (id) on delete cascade,
  permission_id uuid not null references permissions (id) on delete cascade,
  cree_le timestamptz not null default now(),
  primary key (role_id, permission_id)
);

-- --------------------------------------------------------------------------
-- Fonctions de vérification (source de vérité serveur)
-- --------------------------------------------------------------------------

-- Le super administrateur a toujours accès à tout, sans exception, sans
-- dépendre d'une ligne dans role_permissions.
create or replace function a_permission(p_code text)
returns boolean language sql stable as $$
  select
    exists (
      select 1 from profils
       where profils.id = auth.uid() and profils.role = 'super_administrateur'
    )
    or exists (
      select 1
      from profils
      join roles on roles.slug = profils.role::text
      join role_permissions rp on rp.role_id = roles.id
      join permissions perm on perm.id = rp.permission_id
      where profils.id = auth.uid() and perm.slug = p_code
    );
$$;

-- Liste des permissions effectives de l'utilisateur connecté (le frontend
-- l'appelle une fois après connexion pour construire son menu et ses droits).
create or replace function mes_permissions()
returns table(code text) language sql stable as $$
  select perm.slug as code
  from profils
  join roles on roles.slug = profils.role::text
  join role_permissions rp on rp.role_id = roles.id
  join permissions perm on perm.id = rp.permission_id
  where profils.id = auth.uid()
  union
  select perm.slug as code from permissions perm
   where exists (
     select 1 from profils
      where profils.id = auth.uid() and profils.role = 'super_administrateur'
   );
$$;

-- --------------------------------------------------------------------------
-- Sécurité (RLS) sur les tables de permissions elles-mêmes
-- --------------------------------------------------------------------------
alter table roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;

drop policy if exists "Lecture des rôles par l'équipe" on roles;
create policy "Lecture des rôles par l'équipe" on roles for select using (est_membre_equipe());

drop policy if exists "Lecture des permissions par l'équipe" on permissions;
create policy "Lecture des permissions par l'équipe" on permissions for select using (est_membre_equipe());

drop policy if exists "Lecture des attributions par l'équipe" on role_permissions;
create policy "Lecture des attributions par l'équipe" on role_permissions
  for select using (est_membre_equipe());

drop policy if exists "Gestion des permissions par les autorisés" on role_permissions;
create policy "Gestion des permissions par les autorisés" on role_permissions
  for all using (a_permission('roles.manage_permissions'))
  with check (a_permission('roles.manage_permissions'));

-- --------------------------------------------------------------------------
-- Données initiales : les 8 rôles (idempotent)
-- --------------------------------------------------------------------------
-- Le slug 'super_admin' (et non 'super_administrateur') correspond à la
-- ligne déjà existante sur ce projet ; sans impact fonctionnel puisque le
-- contournement du super administrateur dans a_permission()/mes_permissions()
-- se base uniquement sur profils.role, jamais sur ce slug.
insert into roles (slug, name, description) values
  ('super_admin', 'Super administrateur', 'Accès complet à l''administration et à la configuration de l''application.'),
  ('direction', 'Direction', 'Supervision générale de la radio, des contenus, programmes et rapports.'),
  ('producteur', 'Producteur', 'Préparation et production des émissions et contenus audio.'),
  ('animateur', 'Animateur', 'Animation des émissions et préparation des contenus liés à ses émissions.'),
  ('editeur', 'Éditeur', 'Création, modification et publication des contenus éditoriaux.'),
  ('moderateur', 'Modérateur', 'Gestion des signalements et modération de la communauté.'),
  ('equipe_priere', 'Équipe de prière', 'Gestion et suivi des intentions de prière.'),
  ('comptabilite', 'Comptabilité', 'Gestion financière, dons et rapports.')
on conflict (slug) do nothing;

-- --------------------------------------------------------------------------
-- Catalogue des permissions (adapté aux modules réellement présents dans
-- l'application — aucune permission ne renvoie vers une table inexistante).
-- --------------------------------------------------------------------------
insert into permissions (slug, name, module, action, description) values
  ('dashboard.view', 'Voir le tableau de bord', 'dashboard', 'view', 'Voir le tableau de bord'),
  ('dashboard.statistics', 'Voir les statistiques du tableau de bord', 'dashboard', 'statistics', 'Voir les statistiques du tableau de bord'),

  ('users.view', 'Voir la liste des employés', 'users', 'view', 'Voir la liste des employés'),
  ('users.create', 'Créer un compte employé', 'users', 'create', 'Créer un compte employé'),
  ('users.edit', 'Modifier un employé', 'users', 'edit', 'Modifier un employé'),
  ('users.delete', 'Supprimer un compte employé', 'users', 'delete', 'Supprimer un compte employé'),
  ('users.view_activity', 'Voir l''historique d''activité de l''équipe', 'users', 'view_activity', 'Voir l''historique d''activité de l''équipe'),

  ('roles.view', 'Voir les rôles et leurs permissions', 'roles', 'view', 'Voir les rôles et leurs permissions'),
  ('roles.assign', 'Attribuer un rôle à un employé', 'roles', 'assign', 'Attribuer un rôle à un employé'),
  ('roles.manage_permissions', 'Modifier les permissions d''un rôle', 'roles', 'manage_permissions', 'Modifier les permissions d''un rôle'),

  ('articles.view', 'Voir les actualités', 'articles', 'view', 'Voir les actualités'),
  ('articles.create', 'Créer une actualité', 'articles', 'create', 'Créer une actualité'),
  ('articles.edit', 'Modifier une actualité', 'articles', 'edit', 'Modifier une actualité'),
  ('articles.delete', 'Supprimer une actualité', 'articles', 'delete', 'Supprimer une actualité'),
  ('articles.publish', 'Publier une actualité', 'articles', 'publish', 'Publier une actualité'),
  ('articles.schedule', 'Programmer la publication d''une actualité', 'articles', 'schedule', 'Programmer la publication d''une actualité'),
  ('articles.archive', 'Archiver une actualité', 'articles', 'archive', 'Archiver une actualité'),

  ('announcements.view', 'Voir les annonces', 'announcements', 'view', 'Voir les annonces'),
  ('announcements.create', 'Créer une annonce', 'announcements', 'create', 'Créer une annonce'),
  ('announcements.edit', 'Modifier une annonce', 'announcements', 'edit', 'Modifier une annonce'),
  ('announcements.delete', 'Supprimer une annonce', 'announcements', 'delete', 'Supprimer une annonce'),
  ('announcements.publish', 'Publier une annonce', 'announcements', 'publish', 'Publier une annonce'),
  ('announcements.schedule', 'Programmer une annonce', 'announcements', 'schedule', 'Programmer une annonce'),

  ('media.view', 'Voir la médiathèque', 'media', 'view', 'Voir la médiathèque'),
  ('media.upload', 'Ajouter un média', 'media', 'upload', 'Ajouter un média'),
  ('media.edit', 'Modifier un média', 'media', 'edit', 'Modifier un média'),
  ('media.delete', 'Supprimer un média', 'media', 'delete', 'Supprimer un média'),

  ('emissions.view', 'Voir les émissions', 'emissions', 'view', 'Voir les émissions'),
  ('emissions.create', 'Créer une émission', 'emissions', 'create', 'Créer une émission'),
  ('emissions.edit', 'Modifier une émission', 'emissions', 'edit', 'Modifier une émission'),
  ('emissions.delete', 'Supprimer une émission', 'emissions', 'delete', 'Supprimer une émission'),
  ('emissions.schedule', 'Planifier une émission', 'emissions', 'schedule', 'Planifier une émission'),
  ('emissions.publish', 'Publier une émission', 'emissions', 'publish', 'Publier une émission'),
  ('emissions.archive', 'Archiver une émission', 'emissions', 'archive', 'Archiver une émission'),

  ('podcasts.view', 'Voir les épisodes / podcasts', 'podcasts', 'view', 'Voir les épisodes / podcasts'),
  ('podcasts.create', 'Créer un épisode', 'podcasts', 'create', 'Créer un épisode'),
  ('podcasts.edit', 'Modifier un épisode', 'podcasts', 'edit', 'Modifier un épisode'),
  ('podcasts.delete', 'Supprimer un épisode', 'podcasts', 'delete', 'Supprimer un épisode'),
  ('podcasts.publish', 'Publier un épisode', 'podcasts', 'publish', 'Publier un épisode'),
  ('podcasts.archive', 'Archiver un épisode', 'podcasts', 'archive', 'Archiver un épisode'),

  ('programs.view', 'Voir la grille des programmes', 'programs', 'view', 'Voir la grille des programmes'),
  ('programs.create', 'Créer un créneau de grille', 'programs', 'create', 'Créer un créneau de grille'),
  ('programs.edit', 'Modifier la grille des programmes', 'programs', 'edit', 'Modifier la grille des programmes'),

  ('live.view', 'Voir l''état du direct', 'live', 'view', 'Voir l''état du direct'),
  ('live.manage', 'Gérer les réglages du direct', 'live', 'manage', 'Gérer les réglages du direct'),

  ('moderation.view', 'Voir les signalements', 'moderation', 'view', 'Voir les signalements'),
  ('moderation.view_reports', 'Voir les rapports de modération', 'moderation', 'view_reports', 'Voir les rapports de modération'),
  ('moderation.warn', 'Avertir un utilisateur signalé', 'moderation', 'warn', 'Avertir un utilisateur signalé'),
  ('moderation.block', 'Bloquer un utilisateur signalé', 'moderation', 'block', 'Bloquer un utilisateur signalé'),
  ('moderation.unblock', 'Débloquer un utilisateur', 'moderation', 'unblock', 'Débloquer un utilisateur'),
  ('moderation.suspend', 'Suspendre un utilisateur signalé', 'moderation', 'suspend', 'Suspendre un utilisateur signalé'),

  ('prayers.view', 'Voir les demandes de prière', 'prayers', 'view', 'Voir les demandes de prière'),
  ('prayers.create', 'Créer une prière', 'prayers', 'create', 'Créer une prière'),
  ('prayers.edit', 'Modifier une prière', 'prayers', 'edit', 'Modifier une prière'),
  ('prayers.assign', 'Attribuer une demande à un membre', 'prayers', 'assign', 'Attribuer une demande à un membre'),
  ('prayers.respond', 'Répondre à une demande de prière', 'prayers', 'respond', 'Répondre à une demande de prière'),
  ('prayers.mark_processed', 'Marquer une demande comme traitée', 'prayers', 'mark_processed', 'Marquer une demande comme traitée'),
  ('prayers.archive', 'Archiver une demande de prière', 'prayers', 'archive', 'Archiver une demande de prière'),

  ('finance.view', 'Voir les dons et finances', 'finance', 'view', 'Voir les dons et finances'),
  ('finance.reports.view', 'Voir les rapports financiers', 'finance', 'reports_view', 'Voir les rapports financiers'),
  ('finance.reports.export', 'Exporter les rapports financiers', 'finance', 'reports_export', 'Exporter les rapports financiers'),
  ('finance.payments.record', 'Enregistrer un paiement', 'finance', 'payments_record', 'Enregistrer un paiement'),

  ('statistics.view', 'Voir les statistiques générales', 'statistics', 'view', 'Voir les statistiques générales'),
  ('statistics.editorial', 'Voir les statistiques éditoriales', 'statistics', 'editorial', 'Voir les statistiques éditoriales'),
  ('statistics.emissions', 'Voir les statistiques des émissions', 'statistics', 'emissions', 'Voir les statistiques des émissions'),
  ('statistics.podcasts', 'Voir les statistiques des podcasts', 'statistics', 'podcasts', 'Voir les statistiques des podcasts'),
  ('statistics.financial', 'Voir les statistiques financières', 'statistics', 'financial', 'Voir les statistiques financières'),
  ('statistics.users', 'Voir les statistiques d''audience', 'statistics', 'users', 'Voir les statistiques d''audience'),
  ('statistics.export', 'Exporter les statistiques', 'statistics', 'export', 'Exporter les statistiques'),

  ('settings.view', 'Voir les paramètres de l''application', 'settings', 'view', 'Voir les paramètres de l''application'),
  ('settings.edit', 'Modifier les paramètres de l''application', 'settings', 'edit', 'Modifier les paramètres de l''application'),

  ('audit.view', 'Voir le journal d''activité', 'audit', 'view', 'Voir le journal d''activité')
on conflict (slug) do nothing;

-- --------------------------------------------------------------------------
-- Attribution des permissions par rôle (le super administrateur n'a pas
-- besoin d'être listé : la fonction a_permission() lui donne toujours accès).
-- --------------------------------------------------------------------------
do $$
declare
  r_id uuid;
begin
  -- DIRECTION
  select id into r_id from roles where slug = 'direction';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug in (
    'dashboard.view', 'dashboard.statistics',
    'users.view', 'users.view_activity',
    'articles.view', 'articles.create', 'articles.edit', 'articles.publish', 'articles.schedule', 'articles.archive',
    'announcements.view', 'announcements.create', 'announcements.edit', 'announcements.publish', 'announcements.schedule',
    'media.view', 'media.upload',
    'emissions.view', 'emissions.create', 'emissions.edit', 'emissions.schedule', 'emissions.publish',
    'podcasts.view', 'podcasts.create', 'podcasts.edit', 'podcasts.publish',
    'programs.view', 'programs.create', 'programs.edit',
    'statistics.view', 'statistics.editorial', 'statistics.emissions', 'statistics.podcasts', 'statistics.users',
    'finance.view', 'finance.reports.view',
    'audit.view'
  ) on conflict do nothing;

  -- PRODUCTEUR
  select id into r_id from roles where slug = 'producteur';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug in (
    'dashboard.view',
    'emissions.view', 'emissions.create', 'emissions.edit', 'emissions.schedule', 'emissions.archive',
    'podcasts.view', 'podcasts.create', 'podcasts.edit', 'podcasts.archive',
    'programs.view', 'programs.create', 'programs.edit',
    'media.view', 'media.upload', 'media.edit',
    'statistics.view', 'statistics.emissions', 'statistics.podcasts'
  ) on conflict do nothing;

  -- ANIMATEUR
  select id into r_id from roles where slug = 'animateur';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug in (
    'dashboard.view',
    'emissions.view', 'emissions.edit',
    'podcasts.view', 'podcasts.create', 'podcasts.edit',
    'programs.view',
    'media.view', 'media.upload',
    'live.view',
    'statistics.view'
  ) on conflict do nothing;

  -- ÉDITEUR
  select id into r_id from roles where slug = 'editeur';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug in (
    'dashboard.view',
    'articles.view', 'articles.create', 'articles.edit', 'articles.delete',
    'articles.schedule', 'articles.publish', 'articles.archive',
    'announcements.view', 'announcements.create', 'announcements.edit', 'announcements.schedule', 'announcements.publish',
    'media.view', 'media.upload', 'media.edit', 'media.delete',
    'podcasts.view', 'podcasts.edit',
    'emissions.view',
    'statistics.view', 'statistics.editorial'
  ) on conflict do nothing;

  -- MODÉRATEUR
  select id into r_id from roles where slug = 'moderateur';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug in (
    'dashboard.view',
    'moderation.view', 'moderation.view_reports', 'moderation.warn', 'moderation.block', 'moderation.unblock', 'moderation.suspend',
    'users.view',
    'statistics.view'
  ) on conflict do nothing;

  -- ÉQUIPE DE PRIÈRE
  select id into r_id from roles where slug = 'equipe_priere';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug in (
    'dashboard.view',
    'prayers.view', 'prayers.create', 'prayers.edit', 'prayers.assign',
    'prayers.respond', 'prayers.mark_processed', 'prayers.archive',
    'statistics.view'
  ) on conflict do nothing;

  -- COMPTABILITÉ
  select id into r_id from roles where slug = 'comptabilite';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug in (
    'dashboard.view',
    'finance.view', 'finance.payments.record', 'finance.reports.view', 'finance.reports.export',
    'statistics.view', 'statistics.financial'
  ) on conflict do nothing;
end $$;

-- --------------------------------------------------------------------------
-- Renforcement RLS sur le contenu : écriture soumise à une vraie permission
-- (au lieu du seul "est membre de l'équipe"). La lecture publique du contenu
-- publié n'est pas modifiée par ce script.
-- --------------------------------------------------------------------------
drop policy if exists "Écriture articles selon permission" on articles;
create policy "Écriture articles selon permission" on articles
  for all using (a_permission('articles.edit') or a_permission('articles.create'))
  with check (a_permission('articles.edit') or a_permission('articles.create'));

drop policy if exists "Écriture annonces selon permission" on annonces;
create policy "Écriture annonces selon permission" on annonces
  for all using (a_permission('announcements.edit') or a_permission('announcements.create'))
  with check (a_permission('announcements.edit') or a_permission('announcements.create'));

drop policy if exists "Écriture episodes selon permission" on episodes;
create policy "Écriture episodes selon permission" on episodes
  for all using (a_permission('podcasts.edit') or a_permission('podcasts.create'))
  with check (a_permission('podcasts.edit') or a_permission('podcasts.create'));

-- Finances : lecture réservée à ceux qui ont la permission finance.view (en
-- plus de la politique existante « un utilisateur voit ses propres dons »).
drop policy if exists "Lecture des dons par la comptabilité" on dons;
create policy "Lecture des dons par la comptabilité" on dons
  for select using (a_permission('finance.view'));

-- ==========================================================================
-- FIN précédent / DÉBUT schema_direction_gestion_equipe.sql
-- ==========================================================================
-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — LA DIRECTION PEUT AUSSI GÉRER L'ÉQUIPE
-- ==========================================================================
-- À exécuter APRÈS schema_permissions.sql. Correction : la Direction doit,
-- comme le Super administrateur, pouvoir créer des comptes employés et leur
-- attribuer un rôle (pas seulement les consulter). Idempotent.
-- ==========================================================================

do $$
declare r_id uuid;
begin
  select id into r_id from roles where slug = 'direction';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug in ('users.create', 'users.edit', 'roles.assign')
  on conflict do nothing;
end $$;

-- ==========================================================================
-- FIN précédent / DÉBUT schema_role_attribue_par.sql
-- ==========================================================================
-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — TRAÇABILITÉ DE L'ATTRIBUTION DES RÔLES
-- ==========================================================================
-- À exécuter APRÈS schema.sql. Ajoute, sur chaque profil, qui lui a attribué
-- son rôle actuel et quand — affiché dans la page Équipe & rôles.
-- Idempotent (ré-exécutable sans risque).
-- ==========================================================================

alter table profils add column if not exists role_attribue_par uuid references auth.users (id) on delete set null;
alter table profils add column if not exists role_attribue_le timestamptz;

-- ==========================================================================
-- FIN précédent / DÉBUT schema_services_taches.sql
-- ==========================================================================
-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — SERVICES & TÂCHES
-- ==========================================================================
-- À exécuter APRÈS schema_permissions.sql. Ajoute deux briques qui
-- manquaient encore au système d'équipe :
--   1. Les SERVICES (pôles de travail : Production, Rédaction, Technique...),
--      configurables par l'administrateur, associés à chaque employé.
--   2. Les TÂCHES : l'administrateur/responsable attribue une tâche à un
--      employé, qui la voit sur son tableau de bord et reçoit une
--      notification interne.
-- Idempotent. Ne modifie ni ne supprime aucune donnée existante.
-- ==========================================================================

-- --------------------------------------------------------------------------
-- SERVICES
-- --------------------------------------------------------------------------
create table if not exists services (
  id uuid primary key default uuid_generate_v4(),
  nom text not null unique,
  slug text not null unique,
  description text,
  cree_le timestamptz not null default now()
);

alter table profils add column if not exists service_id uuid references services (id) on delete set null;

alter table services enable row level security;

drop policy if exists "Lecture des services par l'équipe" on services;
create policy "Lecture des services par l'équipe" on services
  for select using (est_membre_equipe());

drop policy if exists "Gestion des services par les autorisés" on services;
create policy "Gestion des services par les autorisés" on services
  for all using (a_permission('services.manage'))
  with check (a_permission('services.manage'));

insert into services (nom, slug, description) values
  ('Direction', 'direction', 'Pilotage général de la radio.'),
  ('Production', 'production', 'Préparation et production des émissions.'),
  ('Rédaction', 'redaction', 'Rédaction des actualités et contenus écrits.'),
  ('Animation', 'animation', 'Animation des émissions en direct.'),
  ('Technique', 'technique', 'Studios, diffusion, matériel et incidents techniques.'),
  ('Programmation', 'programmation', 'Grille des programmes et planification.'),
  ('Communication', 'communication', 'Communication et réseaux sociaux.'),
  ('Événementiel', 'evenementiel', 'Organisation des événements et annonces.'),
  ('Comptabilité', 'comptabilite', 'Gestion financière et dons.'),
  ('Équipe de prière', 'equipe_priere', 'Suivi des intentions de prière.')
on conflict (slug) do nothing;

-- --------------------------------------------------------------------------
-- TÂCHES
-- --------------------------------------------------------------------------
create type priorite_tache as enum ('basse', 'normale', 'haute', 'urgente');
create type statut_tache as enum ('a_faire', 'en_cours', 'en_attente', 'terminee', 'validee', 'annulee');

create table if not exists taches (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  description text,
  service_id uuid references services (id) on delete set null,
  assigne_a uuid references auth.users (id) on delete set null,
  cree_par uuid references auth.users (id) on delete set null,
  priorite priorite_tache not null default 'normale',
  statut statut_tache not null default 'a_faire',
  date_debut timestamptz,
  date_limite timestamptz,
  piece_jointe_url text,
  rappel_envoye boolean not null default false,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

create index if not exists taches_assigne_a_idx on taches (assigne_a);

drop trigger if exists taches_touch on taches;
create trigger taches_touch before update on taches
  for each row execute function touch_modifie_le();

alter table taches enable row level security;

drop policy if exists "Un employé voit ses tâches" on taches;
create policy "Un employé voit ses tâches" on taches
  for select using (assigne_a = auth.uid() or a_permission('tasks.view'));

drop policy if exists "Création de tâches selon permission" on taches;
create policy "Création de tâches selon permission" on taches
  for insert with check (a_permission('tasks.create') or a_permission('tasks.assign'));

drop policy if exists "Modification de tâches" on taches;
create policy "Modification de tâches" on taches
  for update using (assigne_a = auth.uid() or a_permission('tasks.edit'))
  with check (assigne_a = auth.uid() or a_permission('tasks.edit'));

drop policy if exists "Suppression de tâches selon permission" on taches;
create policy "Suppression de tâches selon permission" on taches
  for delete using (a_permission('tasks.delete'));

-- --------------------------------------------------------------------------
-- NOTIFICATIONS INTERNES (créées par le système, jamais directement par le
-- client — évite qu'un utilisateur s'envoie de fausses notifications).
-- --------------------------------------------------------------------------
create table if not exists notifications_internes (
  id uuid primary key default uuid_generate_v4(),
  utilisateur_id uuid not null references auth.users (id) on delete cascade,
  titre text not null,
  message text,
  lue boolean not null default false,
  cree_le timestamptz not null default now()
);

create index if not exists notifications_internes_utilisateur_idx
  on notifications_internes (utilisateur_id, lue, cree_le desc);

alter table notifications_internes enable row level security;

drop policy if exists "Un utilisateur voit ses notifications" on notifications_internes;
create policy "Un utilisateur voit ses notifications" on notifications_internes
  for select using (utilisateur_id = auth.uid());

drop policy if exists "Un utilisateur marque ses notifications lues" on notifications_internes;
create policy "Un utilisateur marque ses notifications lues" on notifications_internes
  for update using (utilisateur_id = auth.uid()) with check (utilisateur_id = auth.uid());

create or replace function notifier(p_utilisateur uuid, p_titre text, p_message text)
returns void language plpgsql security definer as $$
begin
  if p_utilisateur is not null then
    insert into notifications_internes (utilisateur_id, titre, message)
    values (p_utilisateur, p_titre, p_message);
  end if;
end;
$$;

-- Notifie l'employé à la création et à chaque changement de statut/priorité.
create or replace function notifier_tache()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    perform notifier(NEW.assigne_a, 'Nouvelle tâche', NEW.titre);
  elsif TG_OP = 'UPDATE' and NEW.assigne_a is not null then
    if NEW.statut = 'validee' and OLD.statut <> 'validee' then
      perform notifier(NEW.assigne_a, 'Tâche validée', NEW.titre);
    elsif NEW.assigne_a <> OLD.assigne_a then
      perform notifier(NEW.assigne_a, 'Tâche qui vous a été attribuée', NEW.titre);
    elsif NEW.statut <> OLD.statut or NEW.priorite <> OLD.priorite or NEW.date_limite is distinct from OLD.date_limite then
      perform notifier(NEW.assigne_a, 'Tâche mise à jour', NEW.titre);
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists taches_notifier on taches;
create trigger taches_notifier after insert or update on taches
  for each row execute function notifier_tache();

-- Rappel d'échéance (best-effort, réutilise pg_cron déjà activé — voir
-- schema_planification.sql. Sans effet si pg_cron est indisponible).
create or replace function rappeler_echeances_taches()
returns void language plpgsql security definer as $$
begin
  update taches
     set rappel_envoye = true
   where rappel_envoye = false
     and statut not in ('terminee', 'validee', 'annulee')
     and date_limite is not null
     and date_limite <= now() + interval '24 hours'
     and date_limite > now();

  insert into notifications_internes (utilisateur_id, titre, message)
  select assigne_a, 'Échéance proche', titre
    from taches
   where rappel_envoye = true
     and statut not in ('terminee', 'validee', 'annulee')
     and date_limite <= now() + interval '24 hours'
     and date_limite > now()
     and assigne_a is not null
     and not exists (
       select 1 from notifications_internes n
        where n.utilisateur_id = taches.assigne_a
          and n.titre = 'Échéance proche'
          and n.message = taches.titre
          and n.cree_le > now() - interval '2 days'
     );
end;
$$;

do $$
begin
  perform cron.unschedule('rappeler-echeances-taches');
exception when others then null;
end $$;

do $$
begin
  perform cron.schedule(
    'rappeler-echeances-taches',
    '*/15 * * * *',
    'select rappeler_echeances_taches();'
  );
exception when others then
  raise notice 'Planification pg_cron impossible pour les rappels de tâches : %', sqlerrm;
end $$;

-- --------------------------------------------------------------------------
-- Nouvelles permissions
-- --------------------------------------------------------------------------
insert into permissions (slug, name, module, action, description) values
  ('services.view', 'Voir la liste des services', 'services', 'view', 'Voir la liste des services'),
  ('services.manage', 'Créer / modifier / supprimer un service', 'services', 'manage', 'Créer / modifier / supprimer un service'),
  ('tasks.view', 'Voir toutes les tâches de l''équipe', 'tasks', 'view', 'Voir toutes les tâches de l''équipe'),
  ('tasks.create', 'Créer une tâche', 'tasks', 'create', 'Créer une tâche'),
  ('tasks.assign', 'Attribuer une tâche à un employé', 'tasks', 'assign', 'Attribuer une tâche à un employé'),
  ('tasks.edit', 'Modifier n''importe quelle tâche', 'tasks', 'edit', 'Modifier n''importe quelle tâche'),
  ('tasks.delete', 'Supprimer une tâche', 'tasks', 'delete', 'Supprimer une tâche'),
  ('tasks.validate', 'Valider une tâche terminée', 'tasks', 'validate', 'Valider une tâche terminée')
on conflict (slug) do nothing;

do $$
declare r_id uuid;
begin
  -- DIRECTION : gère les services et les tâches de toute l'équipe.
  select id into r_id from roles where slug = 'direction';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug in (
    'services.view', 'services.manage',
    'tasks.view', 'tasks.create', 'tasks.assign', 'tasks.edit', 'tasks.validate'
  ) on conflict do nothing;

  -- PRODUCTEUR : responsable de service, attribue des tâches à son équipe.
  select id into r_id from roles where slug = 'producteur';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug in (
    'services.view', 'tasks.view', 'tasks.create', 'tasks.assign', 'tasks.validate'
  ) on conflict do nothing;

  -- Les autres rôles voient et gèrent seulement leurs propres tâches
  -- (déjà couvert par la politique RLS "assigne_a = auth.uid()", aucune
  -- permission supplémentaire nécessaire).
end $$;

-- ==========================================================================
-- FIN précédent / DÉBUT schema_planification.sql
-- ==========================================================================
-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — PUBLICATION PROGRAMMÉE
-- ==========================================================================
-- À exécuter APRÈS schema_editorial.sql. Un contenu au statut "programme"
-- avec une date de publication future devient automatiquement visible du
-- public dès que cette date arrive — sans intervention manuelle.
--
-- Concerne : articles, annonces, episodes, interviews, reportages,
-- communiques (les tables du module éditorial qui ont une date_publication).
-- ==========================================================================

-- 1) Visibilité immédiate dès la date programmée (évaluée à chaque lecture,
--    donc précise à la seconde — pas d'attente d'une tâche planifiée).
do $$
declare t text;
begin
  foreach t in array array['articles', 'annonces', 'episodes', 'interviews', 'reportages', 'communiques'] loop
    execute format('drop policy if exists "Lecture publique du contenu publié" on %I', t);
    execute format(
      'create policy "Lecture publique du contenu publié" on %I
         for select using (
           statut = ''publie''
           or (statut = ''programme'' and date_publication <= now())
           or est_membre_equipe()
         )', t);
  end loop;
end $$;

-- 2) Bascule effective du statut en "publie" (garde le back-office cohérent :
--    compteurs et listes "programmé" vs "publié" à jour dans le temps).
create or replace function publier_contenus_programmes()
returns void language plpgsql security definer as $$
begin
  update articles set statut = 'publie' where statut = 'programme' and date_publication <= now();
  update annonces set statut = 'publie' where statut = 'programme' and date_publication <= now();
  update episodes set statut = 'publie' where statut = 'programme' and date_publication <= now();
  update interviews set statut = 'publie' where statut = 'programme' and date_publication <= now();
  update reportages set statut = 'publie' where statut = 'programme' and date_publication <= now();
  update communiques set statut = 'publie' where statut = 'programme' and date_publication <= now();
end;
$$;

-- 3) Tâche planifiée : exécute la bascule chaque minute (best-effort — si
--    pg_cron n'est pas disponible sur le plan Supabase, la visibilité reste
--    correcte grâce à l'étape 1, seule la mise à jour du statut est différée).
do $$
begin
  execute 'create extension if not exists pg_cron';
exception when others then
  raise notice 'pg_cron indisponible : %', sqlerrm;
end $$;

do $$
begin
  perform cron.unschedule('publier-contenus-programmes');
exception when others then null;
end $$;

do $$
begin
  perform cron.schedule(
    'publier-contenus-programmes',
    '* * * * *',
    'select publier_contenus_programmes();'
  );
exception when others then
  raise notice 'Planification pg_cron impossible : %', sqlerrm;
end $$;

-- ==========================================================================
-- FIN précédent / DÉBUT schema_securite_profils.sql
-- ==========================================================================
-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — DURCISSEMENT DE LA SÉCURITÉ SUR `profils`
-- ==========================================================================
-- La politique RLS "Un utilisateur gère son profil" (for all using
-- auth.uid() = id) autorisait n'importe quel compte connecté à s'attribuer
-- lui-même n'importe quel rôle ou service via une simple requête du
-- navigateur (insert/update sur `profils` avec juste id = son propre id).
-- Nécessaire maintenant que la page « Mon profil » du back-office permet à
-- chaque employé de modifier lui-même son nom : on restreint précisément ce
-- qu'un utilisateur peut changer sur sa propre ligne.
--
-- Après ce script : un utilisateur connecté peut seulement modifier les
-- colonnes nom/pays/langue de SA PROPRE ligne. La création de compte,
-- l'attribution de rôle et de service restent réservées à l'API admin (clé
-- service_role, qui contourne RLS et les droits ci-dessous).
-- Idempotent, sans effet sur les fonctionnalités existantes.
-- ==========================================================================

revoke insert, delete on profils from authenticated;
revoke update on profils from authenticated;
grant update (nom, pays, langue) on profils to authenticated;

-- ==========================================================================
-- FIN précédent / DÉBUT schema_fichiers_partages.sql
-- ==========================================================================
-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — FICHIERS PARTAGÉS ENTRE L'ÉQUIPE
-- ==========================================================================
-- Permet à Direction / Super administrateur (accès Dispatcher) de déposer un
-- fichier interne (affiche d'événement, document, image...) que les rôles
-- éditoriaux (Producteur, Animateur, Éditeur) peuvent ensuite consulter et
-- utiliser pour décider de publier une annonce, un article, etc. Le bucket
-- est PRIVÉ : contrairement aux images de contenu public, ces fichiers ne
-- sont visibles que par l'équipe interne. Idempotent, à exécuter après
-- schema_permissions.sql.
-- ==========================================================================

insert into storage.buckets (id, name, public)
values ('fichiers-partages', 'fichiers-partages', false)
on conflict (id) do nothing;

create table if not exists fichiers_partages (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  description text,
  chemin text not null,
  type_mime text,
  taille_octets bigint,
  televerse_par uuid references auth.users (id) on delete set null,
  statut text not null default 'nouveau' check (statut in ('nouveau', 'utilise', 'archive')),
  cree_le timestamptz not null default now()
);

alter table fichiers_partages enable row level security;

insert into permissions (slug, name, module, action, description) values
  ('files.share', 'Déposer un fichier partagé pour l''équipe', 'files', 'share', 'Déposer un fichier partagé pour l''équipe'),
  ('files.view', 'Voir et télécharger les fichiers partagés', 'files', 'view', 'Voir et télécharger les fichiers partagés')
on conflict (slug) do nothing;

do $$
declare r_id uuid;
begin
  -- DIRECTION : dépose et consulte, comme le Super administrateur (accès Dispatcher).
  select id into r_id from roles where slug = 'direction';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug in ('files.share', 'files.view')
  on conflict do nothing;

  -- Rôles éditoriaux : consultent seulement, pour décider de publier ou non.
  select id into r_id from roles where slug = 'producteur';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug = 'files.view' on conflict do nothing;

  select id into r_id from roles where slug = 'animateur';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug = 'files.view' on conflict do nothing;

  select id into r_id from roles where slug = 'editeur';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug = 'files.view' on conflict do nothing;
end $$;

drop policy if exists "Lecture des fichiers partagés" on fichiers_partages;
create policy "Lecture des fichiers partagés" on fichiers_partages
  for select using (a_permission('files.view') or a_permission('files.share'));

drop policy if exists "Dépôt des fichiers partagés" on fichiers_partages;
create policy "Dépôt des fichiers partagés" on fichiers_partages
  for insert with check (a_permission('files.share') and televerse_par = auth.uid());

drop policy if exists "Gestion des fichiers partagés" on fichiers_partages;
create policy "Gestion des fichiers partagés" on fichiers_partages
  for update using (a_permission('files.share') or a_permission('files.view'))
  with check (a_permission('files.share') or a_permission('files.view'));

drop policy if exists "Suppression des fichiers partagés" on fichiers_partages;
create policy "Suppression des fichiers partagés" on fichiers_partages
  for delete using (a_permission('files.share'));

-- Stockage : mêmes règles ; le chemin est <identifiant-aléatoire>/<nom-original>.
drop policy if exists "Lecture du bucket fichiers-partages" on storage.objects;
create policy "Lecture du bucket fichiers-partages" on storage.objects
  for select using (
    bucket_id = 'fichiers-partages' and (a_permission('files.view') or a_permission('files.share'))
  );

drop policy if exists "Dépôt dans le bucket fichiers-partages" on storage.objects;
create policy "Dépôt dans le bucket fichiers-partages" on storage.objects
  for insert with check (
    bucket_id = 'fichiers-partages' and a_permission('files.share')
  );

drop policy if exists "Suppression dans le bucket fichiers-partages" on storage.objects;
create policy "Suppression dans le bucket fichiers-partages" on storage.objects
  for delete using (
    bucket_id = 'fichiers-partages' and a_permission('files.share')
  );

