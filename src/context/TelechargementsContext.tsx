import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, type DownloadTask } from "expo-file-system";
import * as Network from "expo-network";
import { Platform } from "react-native";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSettings } from "@/context/SettingsContext";
import {
  assurerDossierTelechargements,
  fichierExisteEncore,
  fichierPour,
  supprimerFichier,
} from "@/lib/telechargements";
import type { PisteAudioType } from "@/types";

const CLE_TELECHARGEMENTS = "@rndb/telechargements";

export type StatutTelechargement = "en_cours" | "termine" | "erreur";

export interface TelechargementItem {
  id: string;
  type: PisteAudioType;
  titre: string;
  sousTitre: string;
  imageUrl: string;
  audioUrlDistante: string;
  cheminLocal: string;
  statut: StatutTelechargement;
  progression: number;
  taille?: number;
}

interface TelechargementsContextValeur {
  telechargements: Record<string, TelechargementItem>;
  estTelecharge: (id: string) => boolean;
  progressionDe: (id: string) => number;
  cheminLocalDe: (id: string) => string | null;
  telecharger: (item: {
    id: string;
    type: PisteAudioType;
    titre: string;
    sousTitre: string;
    imageUrl: string;
    audioUrl: string;
  }) => Promise<void>;
  annuler: (id: string) => void;
  supprimer: (id: string) => void;
  erreurWifiRequis: string | null;
  effacerErreur: () => void;
}

const TelechargementsContext = createContext<TelechargementsContextValeur | null>(null);

export function TelechargementsProvider({ children }: { children: React.ReactNode }) {
  const { telechargementWifiUniquement } = useSettings();
  const [telechargements, setTelechargements] = useState<Record<string, TelechargementItem>>({});
  const [erreurWifiRequis, setErreurWifiRequis] = useState<string | null>(null);
  const tachesRef = useRef<Record<string, DownloadTask>>({});

  useEffect(() => {
    (async () => {
      assurerDossierTelechargements();
      const brut = await AsyncStorage.getItem(CLE_TELECHARGEMENTS);
      if (!brut) return;
      const sauvegarde: Record<string, TelechargementItem> = JSON.parse(brut);
      const verifies: Record<string, TelechargementItem> = {};
      for (const [id, item] of Object.entries(sauvegarde)) {
        if (item.statut !== "termine") continue;
        const { exists, size } = fichierExisteEncore(item.cheminLocal);
        if (exists) {
          verifies[id] = { ...item, taille: size };
        }
      }
      setTelechargements(verifies);
    })();
  }, []);

  const persister = useCallback((suivant: Record<string, TelechargementItem>) => {
    const aSauvegarder = Object.fromEntries(
      Object.entries(suivant).filter(([, item]) => item.statut === "termine")
    );
    AsyncStorage.setItem(CLE_TELECHARGEMENTS, JSON.stringify(aSauvegarder));
  }, []);

  const majItem = useCallback(
    (id: string, patch: Partial<TelechargementItem>) => {
      setTelechargements((precedent) => {
        const existant = precedent[id];
        if (!existant) return precedent;
        const suivant = { ...precedent, [id]: { ...existant, ...patch } };
        persister(suivant);
        return suivant;
      });
    },
    [persister]
  );

  const telecharger = useCallback(
    async (item: {
      id: string;
      type: PisteAudioType;
      titre: string;
      sousTitre: string;
      imageUrl: string;
      audioUrl: string;
    }) => {
      if (Platform.OS === "web") {
        setErreurWifiRequis("Le téléchargement hors-ligne n'est pas disponible dans la version web.");
        return;
      }
      if (telechargementWifiUniquement) {
        const etatReseau = await Network.getNetworkStateAsync();
        if (etatReseau.type !== Network.NetworkStateType.WIFI) {
          setErreurWifiRequis(
            "Le téléchargement en Wi-Fi uniquement est activé dans les paramètres."
          );
          return;
        }
      }

      assurerDossierTelechargements();
      const fichierDestination = fichierPour(item.id, item.audioUrl);
      if (fichierDestination.exists) fichierDestination.delete();

      setTelechargements((precedent) => ({
        ...precedent,
        [item.id]: {
          id: item.id,
          type: item.type,
          titre: item.titre,
          sousTitre: item.sousTitre,
          imageUrl: item.imageUrl,
          audioUrlDistante: item.audioUrl,
          cheminLocal: fichierDestination.uri,
          statut: "en_cours",
          progression: 0,
        },
      }));

      const tache = File.createDownloadTask(item.audioUrl, fichierDestination, {
        onProgress: ({ bytesWritten, totalBytes }) => {
          const ratio = totalBytes > 0 ? bytesWritten / totalBytes : 0;
          majItem(item.id, { progression: ratio });
        },
      });
      tachesRef.current[item.id] = tache;

      try {
        const resultat = await tache.downloadAsync();
        delete tachesRef.current[item.id];
        if (!resultat) {
          majItem(item.id, { statut: "erreur" });
          return;
        }
        majItem(item.id, {
          statut: "termine",
          progression: 1,
          cheminLocal: resultat.uri,
          taille: resultat.size,
        });
      } catch {
        delete tachesRef.current[item.id];
        majItem(item.id, { statut: "erreur" });
      }
    },
    [telechargementWifiUniquement, majItem]
  );

  const annuler = useCallback((id: string) => {
    const tache = tachesRef.current[id];
    if (tache) {
      tache.cancel();
      delete tachesRef.current[id];
    }
    setTelechargements((precedent) => {
      const { [id]: _supprime, ...reste } = precedent;
      return reste;
    });
  }, []);

  const supprimer = useCallback(
    (id: string) => {
      setTelechargements((precedent) => {
        const item = precedent[id];
        if (item) supprimerFichier(item.cheminLocal);
        const { [id]: _retire, ...reste } = precedent;
        persister(reste);
        return reste;
      });
    },
    [persister]
  );

  const estTelecharge = useCallback(
    (id: string) => telechargements[id]?.statut === "termine",
    [telechargements]
  );

  const progressionDe = useCallback(
    (id: string) => telechargements[id]?.progression ?? 0,
    [telechargements]
  );

  const cheminLocalDe = useCallback(
    (id: string) =>
      telechargements[id]?.statut === "termine" ? telechargements[id].cheminLocal : null,
    [telechargements]
  );

  const effacerErreur = useCallback(() => setErreurWifiRequis(null), []);

  const valeur = useMemo<TelechargementsContextValeur>(
    () => ({
      telechargements,
      estTelecharge,
      progressionDe,
      cheminLocalDe,
      telecharger,
      annuler,
      supprimer,
      erreurWifiRequis,
      effacerErreur,
    }),
    [
      telechargements,
      estTelecharge,
      progressionDe,
      cheminLocalDe,
      telecharger,
      annuler,
      supprimer,
      erreurWifiRequis,
      effacerErreur,
    ]
  );

  return (
    <TelechargementsContext.Provider value={valeur}>
      {children}
    </TelechargementsContext.Provider>
  );
}

export function useTelechargements() {
  const contexte = useContext(TelechargementsContext);
  if (!contexte) {
    throw new Error(
      "useTelechargements doit être utilisé à l'intérieur de TelechargementsProvider"
    );
  }
  return contexte;
}
