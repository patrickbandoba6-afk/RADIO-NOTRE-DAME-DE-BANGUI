"use client";

import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseEstConfigure = url.length > 0 && cle.length > 0;

/**
 * Client Supabase du navigateur. L'autorisation réelle est assurée par les
 * politiques RLS de la base (`est_membre_equipe()`), pas par l'interface.
 */
export const supabase = supabaseEstConfigure ? createBrowserClient(url, cle) : null;

export const BUCKET_IMAGES = "contenu-images";

/** Téléverse un fichier dans le bucket public et renvoie son URL. */
export async function televerserFichier(fichier: File, dossier: string): Promise<string> {
  if (!supabase) throw new Error("Supabase n'est pas configuré.");

  const extension = fichier.name.split(".").pop() ?? "bin";
  const nom = `${dossier}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET_IMAGES).upload(nom, fichier, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET_IMAGES).getPublicUrl(nom);
  return data.publicUrl;
}
