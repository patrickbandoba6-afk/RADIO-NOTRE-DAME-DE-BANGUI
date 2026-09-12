-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — INFOS ENVOYÉES PAR LES AUDITEURS
-- ==========================================================================
-- Tout auditeur connecté (profil client, pas seulement le personnel) peut
-- envoyer une information à la radio (accident, information locale, demande
-- de diffusion) avec une photo optionnelle. Ce n'est JAMAIS public : seuls
-- l'auteur et l'équipe autorisée (permission citizen_reports.view) peuvent
-- les consulter — pas les autres auditeurs. C'est ensuite l'équipe qui
-- décide si et comment elle en parle à l'antenne. Idempotent.
-- ==========================================================================

create table if not exists signalements_citoyens (
  id uuid primary key default uuid_generate_v4(),
  utilisateur_id uuid not null references auth.users (id) on delete cascade,
  categorie text not null default 'information' check (categorie in ('accident', 'information', 'demande_diffusion', 'autre')),
  titre text not null,
  description text,
  image_url text,
  statut text not null default 'nouveau' check (statut in ('nouveau', 'traite', 'archive')),
  cree_le timestamptz not null default now()
);

alter table signalements_citoyens enable row level security;

insert into storage.buckets (id, name, public)
values ('signalements-citoyens', 'signalements-citoyens', false)
on conflict (id) do nothing;

insert into permissions (slug, name, module, action, description) values
  ('citizen_reports.view', 'Voir les informations envoyées par les auditeurs', 'citizen_reports', 'view', 'Voir les informations envoyées par les auditeurs'),
  ('citizen_reports.manage', 'Traiter les informations envoyées par les auditeurs', 'citizen_reports', 'manage', 'Traiter les informations envoyées par les auditeurs')
on conflict (slug) do nothing;

do $$
declare r_id uuid;
begin
  select id into r_id from roles where slug = 'direction';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug in ('citizen_reports.view', 'citizen_reports.manage')
  on conflict do nothing;

  select id into r_id from roles where slug = 'moderateur';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug in ('citizen_reports.view', 'citizen_reports.manage')
  on conflict do nothing;

  select id into r_id from roles where slug = 'producteur';
  insert into role_permissions (role_id, permission_id)
  select r_id, id from permissions where slug = 'citizen_reports.view'
  on conflict do nothing;
end $$;

drop policy if exists "Un auditeur envoie ses infos" on signalements_citoyens;
create policy "Un auditeur envoie ses infos" on signalements_citoyens
  for insert with check (auth.uid() = utilisateur_id);

drop policy if exists "Un auditeur voit ses propres infos, l'équipe voit tout" on signalements_citoyens;
create policy "Un auditeur voit ses propres infos, l'équipe voit tout" on signalements_citoyens
  for select using (auth.uid() = utilisateur_id or a_permission('citizen_reports.view'));

drop policy if exists "L'équipe traite les infos" on signalements_citoyens;
create policy "L'équipe traite les infos" on signalements_citoyens
  for update using (a_permission('citizen_reports.manage')) with check (a_permission('citizen_reports.manage'));

drop policy if exists "L'équipe supprime les infos" on signalements_citoyens;
create policy "L'équipe supprime les infos" on signalements_citoyens
  for delete using (a_permission('citizen_reports.manage'));

drop policy if exists "Dépôt photo signalement citoyen" on storage.objects;
create policy "Dépôt photo signalement citoyen" on storage.objects
  for insert with check (
    bucket_id = 'signalements-citoyens' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Lecture photo signalement citoyen" on storage.objects;
create policy "Lecture photo signalement citoyen" on storage.objects
  for select using (
    bucket_id = 'signalements-citoyens'
    and ((storage.foldername(name))[1] = auth.uid()::text or a_permission('citizen_reports.view'))
  );

drop policy if exists "Suppression photo signalement citoyen" on storage.objects;
create policy "Suppression photo signalement citoyen" on storage.objects
  for delete using (
    bucket_id = 'signalements-citoyens' and a_permission('citizen_reports.manage')
  );
