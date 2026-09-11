import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { alerter } from "@/lib/alerte";
import { colors, espacement, rayon } from "@/theme/colors";
import type { ConfidentialitePriere } from "@/types";

const CATEGORIES = ["Santé", "Famille", "Travail", "Études", "Nation", "Autre"];
const CONFIDENTIALITES: ConfidentialitePriere[] = ["publique", "privee", "anonyme"];

export function NouvelleDemandePriereScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [texte, setTexte] = useState("");
  const [categorie, setCategorie] = useState(CATEGORIES[0]);
  const [confidentialite, setConfidentialite] = useState<ConfidentialitePriere>("publique");

  function envoyer() {
    if (!texte.trim()) return;
    alerter(t("priere.nouvelleDemande"), t("priere.statutRecue"));
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.conteneur} contentContainerStyle={{ padding: espacement.md, paddingBottom: 140 }}>
      <Text style={styles.titre}>{t("priere.nouvelleDemande")}</Text>

      <TextInput
        style={styles.zoneTexte}
        multiline
        placeholder={t("priere.maDemandeTexte") as string}
        placeholderTextColor={colors.texteSecondaire}
        value={texte}
        onChangeText={setTexte}
      />

      <Text style={styles.label}>{t("priere.categorie")}</Text>
      <View style={styles.puces}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.puce, categorie === cat && styles.puceActive]}
            onPress={() => setCategorie(cat)}
          >
            <Text style={[styles.puceTexte, categorie === cat && styles.puceTexteActif]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t("priere.confidentialite")}</Text>
      {CONFIDENTIALITES.map((option) => (
        <TouchableOpacity
          key={option}
          style={styles.optionConfidentialite}
          onPress={() => setConfidentialite(option)}
        >
          <View style={[styles.radio, confidentialite === option && styles.radioActif]} />
          <Text style={styles.optionTexte}>
            {t(
              `priere.confidentialite${
                option === "publique" ? "Publique" : option === "privee" ? "Privee" : "Anonyme"
              }`
            )}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.boutonEnvoyer} onPress={envoyer}>
        <Text style={styles.boutonEnvoyerTexte}>{t("commun.envoyer")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  titre: { color: colors.texte, fontSize: 20, fontWeight: "800", marginBottom: espacement.md },
  zoneTexte: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.md,
    color: colors.texte,
    minHeight: 120,
    textAlignVertical: "top",
  },
  label: { color: colors.texte, fontSize: 14, fontWeight: "700", marginTop: espacement.lg, marginBottom: espacement.sm },
  puces: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  puce: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: rayon.rond, backgroundColor: colors.carte },
  puceActive: { backgroundColor: colors.primaire },
  puceTexte: { color: colors.texteSecondaire, fontSize: 12 },
  puceTexteActif: { color: colors.fond, fontWeight: "700" },
  optionConfidentialite: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.texteSecondaire },
  radioActif: { borderColor: colors.primaire, backgroundColor: colors.primaire },
  optionTexte: { color: colors.texte, fontSize: 13 },
  boutonEnvoyer: {
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: espacement.xl,
  },
  boutonEnvoyerTexte: { color: colors.fond, fontWeight: "700", fontSize: 15 },
});
