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
