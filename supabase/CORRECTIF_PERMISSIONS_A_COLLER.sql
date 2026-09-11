-- ==========================================================================
-- CORRECTIF RBAC — À COLLER EN UNE SEULE FOIS DANS L'ÉDITEUR SQL SUPABASE
-- Corrige a_permission()/mes_permissions() (colonnes réelles slug/name)
-- et ajoute les permissions manquantes (tâches, services, fichiers).
-- Idempotent : peut être ré-exécuté sans risque.
-- ==========================================================================

-- ==========================================================================
-- schema_permissions.sql
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
-- schema_direction_gestion_equipe.sql
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
-- schema_services_taches.sql
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
-- schema_fichiers_partages.sql
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

