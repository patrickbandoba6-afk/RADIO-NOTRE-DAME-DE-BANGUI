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
