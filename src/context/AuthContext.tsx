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

interface AuthContextValeur {
  utilisateur: UtilisateurProfil | null;
  enChargement: boolean;
  connecterAvecEmail: (email: string, motDePasse: string) => Promise<string | null>;
  inscrireAvecEmail: (email: string, motDePasse: string) => Promise<string | null>;
  continuerEnInvite: () => void;
  seDeconnecter: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValeur | null>(null);

const INVITE: UtilisateurProfil = {
  id: "invite",
  nom: "Invité",
  langue: "fr",
  estInvite: true,
};

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
        setUtilisateur({
          id: data.session.user.id,
          nom: data.session.user.email ?? "Utilisateur",
          email: data.session.user.email ?? undefined,
          langue: "fr",
          estInvite: false,
        });
      }
      setEnChargement(false);
    });

    const { data: abonnement } = supabase.auth.onAuthStateChange((_evenement, session) => {
      if (session?.user) {
        setUtilisateur({
          id: session.user.id,
          nom: session.user.email ?? "Utilisateur",
          email: session.user.email ?? undefined,
          langue: "fr",
          estInvite: false,
        });
      } else {
        setUtilisateur(null);
      }
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

  const inscrireAvecEmail = useCallback(async (email: string, motDePasse: string) => {
    if (!supabase) return "Le service de connexion n'est pas configuré.";
    const { error } = await supabase.auth.signUp({ email, password: motDePasse });
    return error?.message ?? null;
  }, []);

  const continuerEnInvite = useCallback(() => {
    setUtilisateur(INVITE);
  }, []);

  const seDeconnecter = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUtilisateur(null);
  }, []);

  const valeur = useMemo<AuthContextValeur>(
    () => ({
      utilisateur,
      enChargement,
      connecterAvecEmail,
      inscrireAvecEmail,
      continuerEnInvite,
      seDeconnecter,
    }),
    [utilisateur, enChargement, connecterAvecEmail, inscrireAvecEmail, continuerEnInvite, seDeconnecter]
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
