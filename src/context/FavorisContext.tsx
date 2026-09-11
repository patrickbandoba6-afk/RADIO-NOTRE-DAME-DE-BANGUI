import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import type { TypeContenu } from "@/types/editorial";

const CLE_FAVORIS = "@rndb/favoris";

export type TypeFavori = TypeContenu;

interface FavorisContextValeur {
  estFavori: (type: TypeFavori, id: string) => boolean;
  basculerFavori: (type: TypeFavori, id: string) => void;
  favorisParType: (type: TypeFavori) => string[];
}

const FavorisContext = createContext<FavorisContextValeur | null>(null);

function cleFavori(type: TypeFavori, id: string) {
  return `${type}:${id}`;
}

export function FavorisProvider({ children }: { children: React.ReactNode }) {
  const { utilisateur } = useAuth();
  const [favoris, setFavoris] = useState<Set<string>>(new Set());

  // Chargement local (fonctionne hors ligne et en mode invité).
  useEffect(() => {
    AsyncStorage.getItem(CLE_FAVORIS).then((brut) => {
      if (brut) setFavoris(new Set(JSON.parse(brut)));
    });
  }, []);

  // Synchronisation avec Supabase pour les utilisateurs connectés (non invités).
  useEffect(() => {
    if (!supabase || !utilisateur || utilisateur.estInvite) return;
    (async () => {
      const { data, error } = await supabase
        .from("favoris")
        .select("contenu_type, contenu_id")
        .eq("utilisateur_id", utilisateur.id);
      if (error || !data) return;
      setFavoris((precedent) => {
        const distant = data.map((ligne) => cleFavori(ligne.contenu_type as TypeFavori, ligne.contenu_id));
        return new Set([...precedent, ...distant]);
      });
    })();
  }, [utilisateur]);

  const persisterLocal = useCallback((suivant: Set<string>) => {
    AsyncStorage.setItem(CLE_FAVORIS, JSON.stringify([...suivant]));
  }, []);

  const estFavori = useCallback(
    (type: TypeFavori, id: string) => favoris.has(cleFavori(type, id)),
    [favoris]
  );

  const basculerFavori = useCallback(
    (type: TypeFavori, id: string) => {
      const cle = cleFavori(type, id);
      const ajout = !favoris.has(cle);

      setFavoris((precedent) => {
        const suivant = new Set(precedent);
        if (ajout) suivant.add(cle);
        else suivant.delete(cle);
        persisterLocal(suivant);
        return suivant;
      });

      if (supabase && utilisateur && !utilisateur.estInvite) {
        if (ajout) {
          supabase
            .from("favoris")
            .insert({ utilisateur_id: utilisateur.id, contenu_type: type, contenu_id: id })
            .then(() => {});
        } else {
          supabase
            .from("favoris")
            .delete()
            .match({ utilisateur_id: utilisateur.id, contenu_type: type, contenu_id: id })
            .then(() => {});
        }
      }
    },
    [favoris, utilisateur, persisterLocal]
  );

  const favorisParType = useCallback(
    (type: TypeFavori) =>
      [...favoris]
        .filter((cle) => cle.startsWith(`${type}:`))
        .map((cle) => cle.slice(type.length + 1)),
    [favoris]
  );

  const valeur = useMemo<FavorisContextValeur>(
    () => ({ estFavori, basculerFavori, favorisParType }),
    [estFavori, basculerFavori, favorisParType]
  );

  return <FavorisContext.Provider value={valeur}>{children}</FavorisContext.Provider>;
}

export function useFavoris() {
  const contexte = useContext(FavorisContext);
  if (!contexte) {
    throw new Error("useFavoris doit être utilisé à l'intérieur de FavorisProvider");
  }
  return contexte;
}
