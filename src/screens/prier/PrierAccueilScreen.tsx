import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { AccesRapideItem, QuickAccessGrid } from "@/components/QuickAccessGrid";
import { versetDuJour } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";

export function PrierAccueilScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const items: AccesRapideItem[] = [
    { cle: "bible", libelle: t("bible.titre"), icone: "book-outline", onPress: () => navigation.navigate("Bible") },
    { cle: "priere", libelle: t("priere.titre"), icone: "heart-outline", onPress: () => navigation.navigate("Priere") },
    { cle: "temoignages", libelle: t("temoignages.titre"), icone: "megaphone-outline", onPress: () => navigation.navigate("Temoignages") },
  ];

  return (
    <EcranConteneur>
      <Text style={styles.titrePage}>{t("accueil.journeeAvecDieu")}</Text>

      <TouchableOpacity style={styles.carteVerset} onPress={() => navigation.navigate("Bible")} activeOpacity={0.85}>
        <Text style={styles.label}>{t("bible.versetDuJour")}</Text>
        <Text style={styles.verse}>« {versetDuJour.texte} »</Text>
        <Text style={styles.ref}>{versetDuJour.reference}</Text>
        <Text style={styles.meditation}>{versetDuJour.meditation}</Text>
      </TouchableOpacity>

      <QuickAccessGrid items={items} />

      <TouchableOpacity
        style={styles.boutonPriere}
        onPress={() => navigation.navigate("NouvelleDemandePriere")}
      >
        <Text style={styles.boutonPriereTexte}>{t("priere.nouvelleDemande")}</Text>
      </TouchableOpacity>
    </EcranConteneur>
  );
}

const styles = StyleSheet.create({
  titrePage: { color: colors.texte, fontSize: 22, fontWeight: "800", paddingHorizontal: espacement.md, marginBottom: espacement.md },
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
  meditation: { color: colors.texteSecondaire, fontSize: 13, marginTop: 10, lineHeight: 19 },
  boutonPriere: {
    marginHorizontal: espacement.md,
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: espacement.md,
  },
  boutonPriereTexte: { color: colors.fond, fontWeight: "700", fontSize: 15 },
});
