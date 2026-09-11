-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — TRAÇABILITÉ DE L'ATTRIBUTION DES RÔLES
-- ==========================================================================
-- À exécuter APRÈS schema.sql. Ajoute, sur chaque profil, qui lui a attribué
-- son rôle actuel et quand — affiché dans la page Équipe & rôles.
-- Idempotent (ré-exécutable sans risque).
-- ==========================================================================

alter table profils add column if not exists role_attribue_par uuid references auth.users (id) on delete set null;
alter table profils add column if not exists role_attribue_le timestamptz;
