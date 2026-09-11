import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase côté serveur (routes API) qui lit la session de
 * l'utilisateur connecté depuis les cookies de la requête — utilisé pour
 * vérifier SES propres droits avant d'agir avec la clé de service.
 */
export async function clientAvecSession() {
  const magasinCookies = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return magasinCookies.getAll();
        },
        setAll(cookiesAEcrire: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesAEcrire.forEach(({ name, value, options }) =>
              magasinCookies.set(name, value, options)
            );
          } catch {
            // Appelé depuis un composant serveur sans réponse mutable : sans effet.
          }
        },
      },
    }
  );
}
