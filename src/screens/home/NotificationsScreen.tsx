import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useSettings } from "@/context/SettingsContext";
import { colors, espacement, rayon } from "@/theme/colors";
import type { PreferencesNotification } from "@/types";

const CATEGORIES: (keyof PreferencesNotification)[] = [
  "emissions",
  "directs",
  "predications",
  "podcasts",
  "evenements",
  "verset",
  "priere",
];

const CLE_TRADUCTION: Record<keyof PreferencesNotification, string> = {
  emissions: "notifications.emissions",
  directs: "notifications.directs",
  predications: "notifications.predicationsCat",
  podcasts: "notifications.podcastsCat",
  evenements: "notifications.evenementsCat",
  verset: "notifications.versetCat",
  priere: "notifications.priereCat",
};

export function NotificationsScreen() {
  const { t } = useTranslation();
  const { preferencesNotifications, definirPreferenceNotification } = useSettings();

  return (
    <View style={styles.conteneur}>
      <Text style={styles.titrePage}>{t("notifications.centre")}</Text>
      <Text style={styles.sousTitrePage}>{t("notifications.aucuneNotification")}</Text>

      <Text style={styles.sectionTitre}>{t("notifications.preferencesTitre")}</Text>
      {CATEGORIES.map((categorie) => (
        <View key={categorie} style={styles.ligne}>
          <Text style={styles.libelle}>{t(CLE_TRADUCTION[categorie])}</Text>
          <Switch
            value={preferencesNotifications[categorie]}
            onValueChange={(valeur) => definirPreferenceNotification(categorie, valeur)}
            trackColor={{ true: colors.primaire }}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond, padding: espacement.md },
  titrePage: { color: colors.texte, fontSize: 22, fontWeight: "800" },
  sousTitrePage: { color: colors.texteSecondaire, fontSize: 13, marginTop: 8, marginBottom: espacement.lg },
  sectionTitre: { color: colors.texte, fontSize: 15, fontWeight: "700", marginBottom: espacement.sm },
  ligne: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    paddingHorizontal: espacement.md,
    paddingVertical: 12,
    marginBottom: espacement.sm,
  },
  libelle: { color: colors.texte, fontSize: 14 },
});
