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
