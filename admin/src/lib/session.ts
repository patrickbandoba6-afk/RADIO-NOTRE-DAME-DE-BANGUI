"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type RoleInterne =
  | "super_administrateur"
  | "direction"
  | "producteur"
  | "animateur"
  | "editeur"
  | "moderateur"
  | "equipe_priere"
  | "comptabilite";

export interface Session {
  utilisateurId: string;
  email: string;
  nom: string | null;
  role: RoleInterne | null;
}

export const LIBELLES_ROLE: Record<RoleInterne, string> = {
  super_administrateur: "Super administrateur",
  direction: "Direction",
  producteur: "Producteur",
  animateur: "Animateur",
  editeur: "Éditeur",
  moderateur: "Modérateur",
  equipe_priere: "Équipe de prière",
  comptabilite: "Comptabilité",
};

export const DESCRIPTIONS_ROLE: Record<RoleInterne, string> = {
  super_administrateur: "Accès complet à l'administration et à la configuration de l'application.",
  direction: "Supervision générale de la radio, des contenus, programmes et rapports.",
  producteur: "Préparation et production des émissions et contenus audio.",
  animateur: "Animation des émissions et préparation des contenus liés à ses émissions.",
  editeur: "Création, modification et publication des contenus éditoriaux.",
  moderateur: "Gestion des signalements et modération de la communauté.",
  equipe_priere: "Gestion et suivi des intentions de prière.",
  comptabilite: "Gestion financière, dons et rapports.",
};

/**
 * Groupes de contenu (voir `schemas.ts`) visibles dans le menu latéral selon
 * le rôle — chacun ne voit que ce qui concerne son pôle de travail.
 * "tout" donne accès à l'ensemble des rubriques.
 */
export const GROUPES_PAR_ROLE: Record<RoleInterne, string[] | "tout"> = {
  super_administrateur: "tout",
  direction: "tout",
  producteur: ["Radio", "Diffusion", "Éditorial"],
  animateur: ["Radio", "Diffusion"],
  editeur: ["Éditorial", "Diffusion"],
  moderateur: ["Spiritualité", "Éditorial"],
  equipe_priere: ["Spiritualité"],
  comptabilite: [],
};

interface EtatSession {
  session: Session | null;
  chargement: boolean;
}

/**
 * Récupère l'utilisateur connecté et son rôle interne.
 * Un compte sans rôle dans la table `profils` n'a accès à rien : les
 * politiques RLS refusent alors toute écriture.
 */
export function useSession(): EtatSession {
  const [etat, setEtat] = useState<EtatSession>({ session: null, chargement: true });

  useEffect(() => {
    if (!supabase) {
      setEtat({ session: null, chargement: false });
      return;
    }

    async function charger(utilisateur: { id: string; email?: string } | null) {
      if (!utilisateur) {
        setEtat({ session: null, chargement: false });
        return;
      }
      const { data } = await supabase!
        .from("profils")
        .select("nom, role")
        .eq("id", utilisateur.id)
        .maybeSingle();

      setEtat({
        session: {
          utilisateurId: utilisateur.id,
          email: utilisateur.email ?? "",
          nom: data?.nom ?? null,
          role: (data?.role as RoleInterne | null) ?? null,
        },
        chargement: false,
      });
    }

    supabase.auth.getUser().then(({ data }) => charger(data.user));

    const { data: abonnement } = supabase.auth.onAuthStateChange((_evenement, session) => {
      charger(session?.user ?? null);
    });

    return () => abonnement.subscription.unsubscribe();
  }, []);

  return etat;
}
