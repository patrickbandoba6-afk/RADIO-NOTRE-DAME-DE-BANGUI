import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase à clé de service (secrète). NE JAMAIS importer ce fichier
 * depuis un composant "use client" : la clé ne doit exister que côté
 * serveur (routes API). Elle contourne les politiques RLS — toute
 * vérification de droits doit être faite manuellement avant de l'utiliser.
 */
export function clientServiceRole() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !cle) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY n'est pas configurée dans admin/.env.local."
    );
  }
  return createClient(url, cle, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
