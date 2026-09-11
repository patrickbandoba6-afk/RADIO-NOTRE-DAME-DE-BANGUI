import { getLocales } from "expo-localization";
import { Platform } from "react-native";
import { supabase } from "./supabase";

/**
 * Enregistre une ouverture de l'application à des fins statistiques
 * uniquement (aucune donnée personnelle : pas d'identifiant, pas de
 * position précise — seulement le pays déduit de la région du téléphone).
 * N'échoue jamais bruyamment : les statistiques ne doivent pas gêner l'app.
 */
export async function enregistrerVisite(): Promise<void> {
  if (!supabase) return;
  try {
    const locale = getLocales()[0];
    await supabase.from("visites_app").insert({
      pays: locale?.regionCode ?? null,
      langue: locale?.languageCode ?? null,
      plateforme: Platform.OS,
    });
  } catch {
    // Statistiques best-effort : une erreur réseau ne doit jamais bloquer l'app.
  }
}
