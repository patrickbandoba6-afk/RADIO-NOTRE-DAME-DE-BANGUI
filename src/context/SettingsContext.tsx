import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PreferencesNotification } from "@/types";

const CLE_TELECHARGEMENT_WIFI = "@rndb/telechargement_wifi_uniquement";
const CLE_MODE_FAIBLE_CONNEXION = "@rndb/mode_faible_connexion";
const CLE_PREFERENCES_NOTIFICATIONS = "@rndb/preferences_notifications";

const preferencesNotificationsParDefaut: PreferencesNotification = {
  emissions: true,
  directs: true,
  predications: true,
  podcasts: true,
  evenements: true,
  verset: true,
  priere: true,
};

interface SettingsContextValeur {
  telechargementWifiUniquement: boolean;
  modeFaibleConnexion: boolean;
  preferencesNotifications: PreferencesNotification;
  definirTelechargementWifiUniquement: (valeur: boolean) => void;
  definirModeFaibleConnexion: (valeur: boolean) => void;
  definirPreferenceNotification: (
    categorie: keyof PreferencesNotification,
    valeur: boolean
  ) => void;
}

const SettingsContext = createContext<SettingsContextValeur | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [telechargementWifiUniquement, setTelechargementWifiUniquement] =
    useState(true);
  const [modeFaibleConnexion, setModeFaibleConnexion] = useState(false);
  const [preferencesNotifications, setPreferencesNotifications] = useState(
    preferencesNotificationsParDefaut
  );

  useEffect(() => {
    (async () => {
      const [wifi, faibleConnexion, notifs] = await Promise.all([
        AsyncStorage.getItem(CLE_TELECHARGEMENT_WIFI),
        AsyncStorage.getItem(CLE_MODE_FAIBLE_CONNEXION),
        AsyncStorage.getItem(CLE_PREFERENCES_NOTIFICATIONS),
      ]);
      if (wifi !== null) setTelechargementWifiUniquement(wifi === "true");
      if (faibleConnexion !== null)
        setModeFaibleConnexion(faibleConnexion === "true");
      if (notifs !== null) setPreferencesNotifications(JSON.parse(notifs));
    })();
  }, []);

  const definirTelechargementWifiUniquement = useCallback((valeur: boolean) => {
    setTelechargementWifiUniquement(valeur);
    AsyncStorage.setItem(CLE_TELECHARGEMENT_WIFI, String(valeur));
  }, []);

  const definirModeFaibleConnexion = useCallback((valeur: boolean) => {
    setModeFaibleConnexion(valeur);
    AsyncStorage.setItem(CLE_MODE_FAIBLE_CONNEXION, String(valeur));
  }, []);

  const definirPreferenceNotification = useCallback(
    (categorie: keyof PreferencesNotification, valeur: boolean) => {
      setPreferencesNotifications((precedent) => {
        const suivant = { ...precedent, [categorie]: valeur };
        AsyncStorage.setItem(CLE_PREFERENCES_NOTIFICATIONS, JSON.stringify(suivant));
        return suivant;
      });
    },
    []
  );

  const valeur = useMemo<SettingsContextValeur>(
    () => ({
      telechargementWifiUniquement,
      modeFaibleConnexion,
      preferencesNotifications,
      definirTelechargementWifiUniquement,
      definirModeFaibleConnexion,
      definirPreferenceNotification,
    }),
    [
      telechargementWifiUniquement,
      modeFaibleConnexion,
      preferencesNotifications,
      definirTelechargementWifiUniquement,
      definirModeFaibleConnexion,
      definirPreferenceNotification,
    ]
  );

  return (
    <SettingsContext.Provider value={valeur}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const contexte = useContext(SettingsContext);
  if (!contexte) {
    throw new Error("useSettings doit être utilisé à l'intérieur de SettingsProvider");
  }
  return contexte;
}
