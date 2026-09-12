-- ==========================================================================
-- RADIO NOTRE-DAME DE BANGUI — ÉCRITURE SUR versets_du_jour
-- ==========================================================================
-- La table versets_du_jour (schema.sql) n'avait qu'une politique de lecture
-- publique : personne (pas même l'équipe) ne pouvait y écrire depuis le
-- back-office. Ajoute la politique d'écriture réservée à l'équipe interne,
-- même règle que pour les autres contenus éditoriaux. Idempotent.
-- ==========================================================================

drop policy if exists "Écriture équipe interne" on versets_du_jour;
create policy "Écriture équipe interne" on versets_du_jour
  for all using (est_membre_equipe()) with check (est_membre_equipe());
