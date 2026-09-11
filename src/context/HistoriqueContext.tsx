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
import type { EntreeHistorique } from "@/types/editorial";

const CLE_HISTORIQUE = "@rndb/historique";
const LIMITE = 50;

interface HistoriqueContextValeur {
  historique: EntreeHistorique[];
  enregistrerConsultation: (entree: EntreeHistorique) => void;
  viderHistorique: () => void;
}

const HistoriqueContext = createContext<HistoriqueContextValeur | null>(null);

export function HistoriqueProvider({ children }: { children: React.ReactNode }) {
  const { utilisateur } = useAuth();
  const [historique, setHistorique] = useState<EntreeHistorique[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(CLE_HISTORIQUE).then((brut) => {
      if (brut) setHistorique(JSON.parse(brut));
    });
  }, []);

  const enregistrerConsultation = useCallback(
    (entree: EntreeHistorique) => {
      setHistorique((precedent) => {
        const sansDoublon = precedent.filter(
          (element) => !(element.id === entree.id && element.type === entree.type)
        );
        const suivant = [entree, ...sansDoublon].slice(0, LIMITE);
        AsyncStorage.setItem(CLE_HISTORIQUE, JSON.stringify(suivant));
        return suivant;
      });

      if (supabase && utilisateur && !utilisateur.estInvite) {
        supabase
          .from("historique_consultation")
          .upsert({
            utilisateur_id: utilisateur.id,
            contenu_type: entree.type,
            contenu_id: entree.id,
            titre: entree.titre,
            image_url: entree.imageUrl,
            consulte_le: entree.consulteLeISO,
          })
          .then(() => {});
      }
    },
    [utilisateur]
  );

  const viderHistorique = useCallback(() => {
    setHistorique([]);
    AsyncStorage.removeItem(CLE_HISTORIQUE);
  }, []);

  const valeur = useMemo<HistoriqueContextValeur>(
    () => ({ historique, enregistrerConsultation, viderHistorique }),
    [historique, enregistrerConsultation, viderHistorique]
  );

  return <HistoriqueContext.Provider value={valeur}>{children}</HistoriqueContext.Provider>;
}

export function useHistorique() {
  const contexte = useContext(HistoriqueContext);
  if (!contexte) {
    throw new Error("useHistorique doit être utilisé à l'intérieur de HistoriqueProvider");
  }
  return contexte;
}
