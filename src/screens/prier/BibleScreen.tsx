import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { SectionHeader } from "@/components/SectionHeader";
import { versetDuJour } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";

const PLANS_LECTURE = [
  { id: "plan-1", titre: "Les Évangiles en 30 jours", progression: 0.4 },
  { id: "plan-2", titre: "Les Psaumes de réconfort", progression: 0.15 },
  { id: "plan-3", titre: "La vie de foi (Nouveau Testament)", progression: 0 },
];

export function BibleScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [recherche, setRecherche] = useState("");
  const [favori, setFavori] = useState(false);
  const [copie, setCopie] = useState(false);

  async function partagerVerset() {
    await Clipboard.setStringAsync(`« ${versetDuJour.texte} » — ${versetDuJour.reference}`);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

  return (
    <EcranConteneur>
      <Text style={styles.titrePage}>{t("bible.titre")}</Text>

      <View style={styles.zoneRecherche}>
        <Ionicons name="search" size={16} color={colors.texteSecondaire} />
        <TextInput
          style={styles.inputRecherche}
          placeholder={t("bible.rechercherVerset") as string}
          placeholderTextColor={colors.texteSecondaire}
          value={recherche}
          onChangeText={setRecherche}
        />
      </View>

      <TouchableOpacity
        style={styles.boutonParcourir}
        onPress={() => navigation.navigate("BibleLivres")}
      >
        <Ionicons name="book-outline" size={18} color={colors.fond} />
        <Text style={styles.boutonParcourirTexte}>Parcourir tous les livres (texte et audio)</Text>
      </TouchableOpacity>

      <View style={styles.carteVerset}>
        <Text style={styles.label}>{t("bible.versetDuJour")}</Text>
        <Text style={styles.verse}>« {versetDuJour.texte} »</Text>
        <Text style={styles.ref}>
          {versetDuJour.reference} — {versetDuJour.traduction}
        </Text>
        <Text style={styles.sectionSousTitre}>{t("bible.meditation")}</Text>
        <Text style={styles.meditation}>{versetDuJour.meditation}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.action} onPress={() => setFavori(!favori)}>
            <Ionicons name={favori ? "heart" : "heart-outline"} size={18} color={colors.primaire} />
            <Text style={styles.actionTexte}>{t("commun.favoris")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.action} onPress={partagerVerset}>
            <Ionicons name={copie ? "checkmark" : "share-social-outline"} size={18} color={colors.primaire} />
            <Text style={styles.actionTexte}>{t("bible.partagerVerset")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SectionHeader titre={t("bible.plansLecture")} />
      {PLANS_LECTURE.map((plan) => (
        <View key={plan.id} style={styles.planCarte}>
          <Text style={styles.planTitre}>{plan.titre}</Text>
          <View style={styles.barreProgression}>
            <View style={[styles.progression, { width: `${plan.progression * 100}%` }]} />
          </View>
          <Text style={styles.planPourcentage}>{Math.round(plan.progression * 100)}%</Text>
        </View>
      ))}
    </EcranConteneur>
  );
}

const styles = StyleSheet.create({
  titrePage: { color: colors.texte, fontSize: 22, fontWeight: "800", paddingHorizontal: espacement.md, marginBottom: espacement.md },
  zoneRecherche: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.carte,
    marginHorizontal: espacement.md,
    borderRadius: rayon.md,
    paddingHorizontal: 12,
    marginBottom: espacement.lg,
    gap: 8,
  },
  inputRecherche: { flex: 1, color: colors.texte, paddingVertical: 10 },
  boutonParcourir: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primaire,
    marginHorizontal: espacement.md,
    borderRadius: rayon.rond,
    paddingVertical: 13,
    marginBottom: espacement.lg,
  },
  boutonParcourirTexte: { color: colors.fond, fontWeight: "700", fontSize: 13 },
  carteVerset: {
    marginHorizontal: espacement.md,
    backgroundColor: colors.fondClair,
    borderRadius: rayon.lg,
    padding: espacement.md,
    marginBottom: espacement.lg,
    borderWidth: 1,
    borderColor: colors.primaireSombre,
  },
  label: { color: colors.primaire, fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  verse: { color: colors.texte, fontSize: 17, fontStyle: "italic", marginTop: 8, lineHeight: 23 },
  ref: { color: colors.texteSecondaire, fontSize: 12, marginTop: 8 },
  sectionSousTitre: { color: colors.texte, fontSize: 13, fontWeight: "700", marginTop: 14 },
  meditation: { color: colors.texteSecondaire, fontSize: 13, marginTop: 6, lineHeight: 19 },
  actions: { flexDirection: "row", gap: espacement.lg, marginTop: espacement.md },
  action: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionTexte: { color: colors.texteSecondaire, fontSize: 12 },
  planCarte: {
    marginHorizontal: espacement.md,
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.md,
    marginBottom: espacement.sm,
  },
  planTitre: { color: colors.texte, fontSize: 14, fontWeight: "600", marginBottom: 8 },
  barreProgression: { height: 6, backgroundColor: colors.fondClair, borderRadius: rayon.rond, overflow: "hidden" },
  progression: { height: 6, backgroundColor: colors.primaire },
  planPourcentage: { color: colors.texteSecondaire, fontSize: 11, marginTop: 6 },
});
