import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import type { UtilisateurProfil } from "@/types";
import type { User } from "@supabase/supabase-js";

interface AuthContextValeur {
  utilisateur: UtilisateurProfil | null;
  enChargement: boolean;
  connecterAvecEmail: (email: string, motDePasse: string) => Promise<string | null>;
  inscrireAvecEmail: (
    email: string,
    motDePasse: string,
    nom: string
  ) => Promise<{ erreur: string | null; confirmationRequise: boolean }>;
  continuerEnInvite: () => void;
  seDeconnecter: () => Promise<void>;
  mettreAJourProfil: (champs: { nom?: string; photoUrl?: string }) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValeur | null>(null);

const INVITE: UtilisateurProfil = {
  id: "invite",
  nom: "Invité",
  langue: "fr",
  estInvite: true,
};

function versUtilisateurProfil(utilisateur: User): UtilisateurProfil {
  return {
    id: utilisateur.id,
    nom: (utilisateur.user_metadata?.nom as string | undefined) || utilisateur.email || "Utilisateur",
    email: utilisateur.email ?? undefined,
    photoUrl: (utilisateur.user_metadata?.avatar_url as string | undefined) ?? undefined,
    langue: "fr",
    estInvite: false,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<UtilisateurProfil | null>(null);
  const [enChargement, setEnChargement] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setEnChargement(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUtilisateur(versUtilisateurProfil(data.session.user));
      }
      setEnChargement(false);
    });

    const { data: abonnement } = supabase.auth.onAuthStateChange((_evenement, session) => {
      setUtilisateur(session?.user ? versUtilisateurProfil(session.user) : null);
    });

    return () => abonnement.subscription.unsubscribe();
  }, []);

  const connecterAvecEmail = useCallback(async (email: string, motDePasse: string) => {
    if (!supabase) return "Le service de connexion n'est pas configuré.";
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: motDePasse,
    });
    return error?.message ?? null;
  }, []);

  const inscrireAvecEmail = useCallback(async (email: string, motDePasse: string, nom: string) => {
    if (!supabase) {
      return { erreur: "Le service de connexion n'est pas configuré.", confirmationRequise: false };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password: motDePasse,
      options: { data: { nom } },
    });
    if (error) return { erreur: error.message, confirmationRequise: false };
    // Si le projet Supabase exige la confirmation par e-mail, l'inscription
    // réussit mais aucune session n'est ouverte immédiatement.
    return { erreur: null, confirmationRequise: !data.session };
  }, []);

  const continuerEnInvite = useCallback(() => {
    setUtilisateur(INVITE);
  }, []);

  const seDeconnecter = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUtilisateur(null);
  }, []);

  const mettreAJourProfil = useCallback(
    async (champs: { nom?: string; photoUrl?: string }) => {
      if (!supabase) return "Le service de connexion n'est pas configuré.";
      const donnees: Record<string, string> = {};
      if (champs.nom !== undefined) donnees.nom = champs.nom;
      if (champs.photoUrl !== undefined) donnees.avatar_url = champs.photoUrl;
      const { data, error } = await supabase.auth.updateUser({ data: donnees });
      if (error) return error.message;
      if (data.user) setUtilisateur(versUtilisateurProfil(data.user));
      return null;
    },
    []
  );

  const valeur = useMemo<AuthContextValeur>(
    () => ({
      utilisateur,
      enChargement,
      connecterAvecEmail,
      inscrireAvecEmail,
      continuerEnInvite,
      seDeconnecter,
      mettreAJourProfil,
    }),
    [
      utilisateur,
      enChargement,
      connecterAvecEmail,
      inscrireAvecEmail,
      continuerEnInvite,
      seDeconnecter,
      mettreAJourProfil,
    ]
  );

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexte = useContext(AuthContext);
  if (!contexte) {
    throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider");
  }
  return contexte;
}
