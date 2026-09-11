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
