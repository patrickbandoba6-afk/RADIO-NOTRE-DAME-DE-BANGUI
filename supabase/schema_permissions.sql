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
