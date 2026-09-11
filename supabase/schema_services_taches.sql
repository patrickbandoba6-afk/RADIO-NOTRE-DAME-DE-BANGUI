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
