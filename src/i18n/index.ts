import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

export const LANGUE_STOCKAGE_CLE = "@rndb/langue";

const languesDisponibles = ["fr", "en"] as const;
export type LangueApp = (typeof languesDisponibles)[number];

function detecterLangueParDefaut(): LangueApp {
  const codeAppareil = Localization.getLocales()[0]?.languageCode ?? "fr";
  return languesDisponibles.includes(codeAppareil as LangueApp)
    ? (codeAppareil as LangueApp)
    : "fr";
}

export async function initialiserI18n() {
  const langueEnregistree = await AsyncStorage.getItem(LANGUE_STOCKAGE_CLE);
  const langueInitiale =
    (langueEnregistree as LangueApp | null) ?? detecterLangueParDefaut();

  await i18n.use(initReactI18next).init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    lng: langueInitiale,
    fallbackLng: "fr",
    interpolation: { escapeValue: false },
    compatibilityJSON: "v4",
  });

  return i18n;
}

export async function changerLangue(langue: LangueApp) {
  await AsyncStorage.setItem(LANGUE_STOCKAGE_CLE, langue);
  await i18n.changeLanguage(langue);
}

export default i18n;
