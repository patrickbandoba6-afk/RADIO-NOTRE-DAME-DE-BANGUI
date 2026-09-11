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
