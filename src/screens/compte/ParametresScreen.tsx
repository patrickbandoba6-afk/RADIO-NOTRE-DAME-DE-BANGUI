import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { changerLangue, type LangueApp } from "@/i18n";
import { useSettings } from "@/context/SettingsContext";
import { usePlayer } from "@/context/PlayerContext";
import { colors, espacement, rayon } from "@/theme/colors";
import type { QualiteAudio } from "@/types";

const LANGUES: { code: LangueApp; libelle: string }[] = [
  { code: "fr", libelle: "Français" },
  { code: "en", libelle: "English" },
];

const QUALITES: QualiteAudio[] = ["eco", "standard", "haute"];

export function ParametresScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const {
    telechargementWifiUniquement,
    modeFaibleConnexion,
    definirTelechargementWifiUniquement,
    definirModeFaibleConnexion,
  } = useSettings();
  const { qualiteAudio, definirQualiteAudio } = usePlayer();

  return (
    <ScrollView style={styles.conteneur} contentContainerStyle={{ padding: espacement.md, paddingBottom: 140 }}>
      <Text style={styles.titrePage}>{t("parametres.titre")}</Text>

      <Text style={styles.sectionTitre}>{t("parametres.langue")}</Text>
      <View style={styles.puces}>
        {LANGUES.map((langue) => (
          <TouchableOpacity
            key={langue.code}
            style={[styles.puce, i18n.language === langue.code && styles.puceActive]}
            onPress={() => changerLangue(langue.code)}
          >
            <Text style={[styles.puceTexte, i18n.language === langue.code && styles.puceTexteActif]}>
              {langue.libelle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitre}>{t("parametres.qualiteAudio")}</Text>
      <View style={styles.puces}>
        {QUALITES.map((q) => (
          <TouchableOpacity
            key={q}
            style={[styles.puce, qualiteAudio === q && styles.puceActive]}
            onPress={() => definirQualiteAudio(q)}
          >
            <Text style={[styles.puceTexte, qualiteAudio === q && styles.puceTexteActif]}>
              {t(`lecteur.qualite${q === "eco" ? "Eco" : q === "haute" ? "Haute" : "Standard"}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.ligne}>
        <Text style={styles.libelle}>{t("parametres.telechargementWifi")}</Text>
        <Switch
          value={telechargementWifiUniquement}
          onValueChange={definirTelechargementWifiUniquement}
          trackColor={{ true: colors.primaire }}
        />
      </View>
      <View style={styles.ligne}>
        <Text style={styles.libelle}>{t("parametres.modeFaibleConnexion")}</Text>
        <Switch
          value={modeFaibleConnexion}
          onValueChange={definirModeFaibleConnexion}
          trackColor={{ true: colors.primaire }}
        />
      </View>

      <Text style={styles.sectionTitre}>{t("parametres.aPropos")}</Text>
      <Text style={styles.aPropos}>{t("parametres.version")} 1.0.0</Text>
      <Text style={styles.aPropos}>Développé par Agence Web et Marketing — succursale de GLOBALY_JC</Text>
      <TouchableOpacity
        style={styles.ligneMentions}
        onPress={() => navigation.navigate("MentionsLegales")}
      >
        <Text style={styles.ligneMentionsTexte}>Mentions légales, confidentialité et CGU</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  titrePage: { color: colors.texte, fontSize: 22, fontWeight: "800", marginBottom: espacement.lg },
  sectionTitre: { color: colors.texte, fontSize: 15, fontWeight: "700", marginTop: espacement.md, marginBottom: espacement.sm },
  puces: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  puce: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: rayon.rond, backgroundColor: colors.carte },
  puceActive: { backgroundColor: colors.primaire },
  puceTexte: { color: colors.texteSecondaire, fontSize: 12 },
  puceTexteActif: { color: colors.fond, fontWeight: "700" },
  ligne: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    paddingHorizontal: espacement.md,
    paddingVertical: 12,
    marginTop: espacement.sm,
  },
  libelle: { color: colors.texte, fontSize: 13, flex: 1, marginRight: espacement.sm },
  aPropos: { color: colors.texteSecondaire, fontSize: 13 },
  ligneMentions: { marginTop: espacement.md },
  ligneMentionsTexte: { color: colors.primaire, fontSize: 13, fontWeight: "600" },
});
