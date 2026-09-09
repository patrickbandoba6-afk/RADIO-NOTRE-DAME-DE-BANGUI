import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { donsHistorique } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";

const MONTANTS = [5, 10, 20, 50, 100];
const DEVISES = ["EUR", "USD", "XAF"];

export function DonsScreen() {
  const { t } = useTranslation();
  const [montant, setMontant] = useState<number>(20);
  const [montantPersonnalise, setMontantPersonnalise] = useState("");
  const [devise, setDevise] = useState("EUR");
  const [recurrent, setRecurrent] = useState(false);

  function faireLeDon() {
    const valeur = montantPersonnalise ? Number(montantPersonnalise) : montant;
    if (!valeur || valeur <= 0) return;
    Alert.alert(t("dons.merci") as string, `${valeur} ${devise}`);
  }

  return (
    <ScrollView style={styles.conteneur} contentContainerStyle={{ padding: espacement.md, paddingBottom: 140 }}>
      <Text style={styles.titrePage}>{t("dons.titre")}</Text>
      <Text style={styles.sousTitrePage}>{t("dons.sousTitre")}</Text>

      <View style={styles.puces}>
        <TouchableOpacity
          style={[styles.puceType, !recurrent && styles.puceTypeActive]}
          onPress={() => setRecurrent(false)}
        >
          <Text style={[styles.puceTypeTexte, !recurrent && styles.puceTypeTexteActif]}>
            {t("dons.donPonctuel")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.puceType, recurrent && styles.puceTypeActive]}
          onPress={() => setRecurrent(true)}
        >
          <Text style={[styles.puceTypeTexte, recurrent && styles.puceTypeTexteActif]}>
            {t("dons.donRecurrent")}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitre}>{t("dons.montant")}</Text>
      <View style={styles.puces}>
        {MONTANTS.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.puce, montant === m && !montantPersonnalise && styles.puceActive]}
            onPress={() => {
              setMontant(m);
              setMontantPersonnalise("");
            }}
          >
            <Text style={[styles.puceTexte, montant === m && !montantPersonnalise && styles.puceTexteActif]}>
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.inputMontant}
        placeholder="Autre montant"
        placeholderTextColor={colors.texteSecondaire}
        keyboardType="numeric"
        value={montantPersonnalise}
        onChangeText={setMontantPersonnalise}
      />

      <Text style={styles.sectionTitre}>{t("dons.devise")}</Text>
      <View style={styles.puces}>
        {DEVISES.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.puce, devise === d && styles.puceActive]}
            onPress={() => setDevise(d)}
          >
            <Text style={[styles.puceTexte, devise === d && styles.puceTexteActif]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitre}>{t("dons.moyenPaiement")}</Text>
      <View style={styles.puces}>
        <View style={styles.puceInfo}>
          <Text style={styles.puceInfoTexte}>{t("dons.carteBancaire")}</Text>
        </View>
        <View style={styles.puceInfo}>
          <Text style={styles.puceInfoTexte}>{t("dons.mobileMoney")}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.boutonDon} onPress={faireLeDon}>
        <Text style={styles.boutonDonTexte}>{t("dons.titre")}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitre}>{t("dons.historiqueDons")}</Text>
      {donsHistorique.map((don) => (
        <View key={don.id} style={styles.ligneHistorique}>
          <Text style={styles.historiqueMontant}>
            {don.montant} {don.devise}
          </Text>
          <Text style={styles.historiqueDate}>{don.date}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  titrePage: { color: colors.texte, fontSize: 22, fontWeight: "800" },
  sousTitrePage: { color: colors.texteSecondaire, fontSize: 13, marginTop: 6, marginBottom: espacement.lg },
  puces: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  puceType: { flex: 1, paddingVertical: 10, borderRadius: rayon.rond, backgroundColor: colors.carte, alignItems: "center" },
  puceTypeActive: { backgroundColor: colors.primaire },
  puceTypeTexte: { color: colors.texteSecondaire, fontSize: 13, fontWeight: "600" },
  puceTypeTexteActif: { color: colors.fond },
  sectionTitre: { color: colors.texte, fontSize: 15, fontWeight: "700", marginTop: espacement.lg, marginBottom: espacement.sm },
  puce: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: rayon.rond, backgroundColor: colors.carte },
  puceActive: { backgroundColor: colors.primaire },
  puceTexte: { color: colors.texteSecondaire, fontSize: 13 },
  puceTexteActif: { color: colors.fond, fontWeight: "700" },
  inputMontant: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    paddingHorizontal: espacement.md,
    paddingVertical: 10,
    color: colors.texte,
    marginTop: espacement.sm,
  },
  puceInfo: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: rayon.rond, backgroundColor: colors.fondClair },
  puceInfoTexte: { color: colors.texteSecondaire, fontSize: 12 },
  boutonDon: {
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: espacement.xl,
  },
  boutonDonTexte: { color: colors.fond, fontWeight: "700", fontSize: 15 },
  ligneHistorique: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    paddingHorizontal: espacement.md,
    paddingVertical: 10,
    marginBottom: espacement.sm,
  },
  historiqueMontant: { color: colors.texte, fontSize: 13, fontWeight: "600" },
  historiqueDate: { color: colors.texteSecondaire, fontSize: 12 },
});
