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
