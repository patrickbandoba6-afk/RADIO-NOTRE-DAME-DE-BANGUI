import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { demandesPriere } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";
import type { DemandePriere, StatutPriere } from "@/types";

const ONGLETS = ["demandesCommunaute", "mesDemandes"] as const;

const COULEUR_STATUT: Record<StatutPriere, string> = {
  recue: colors.texteSecondaire,
  en_priere: colors.attente,
  traitee: colors.succes,
};

export function PriereScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [onglet, setOnglet] = useState<(typeof ONGLETS)[number]>("demandesCommunaute");
  const [demandes, setDemandes] = useState<DemandePriere[]>(demandesPriere);

  function jePrie(id: string) {
    setDemandes((precedent) =>
      precedent.map((d) =>
        d.id === id ? { ...d, nombrePersonnesQuiPrient: d.nombrePersonnesQuiPrient + 1 } : d
      )
    );
  }

  const donnees =
    onglet === "demandesCommunaute" ? demandes.filter((d) => d.confidentialite !== "privee") : demandes;

  return (
    <View style={styles.conteneur}>
      <View style={styles.entete}>
        <Text style={styles.titrePage}>{t("priere.titre")}</Text>
        <TouchableOpacity
          style={styles.boutonNouveau}
          onPress={() => navigation.navigate("NouvelleDemandePriere")}
        >
          <Ionicons name="add" size={22} color={colors.fond} />
        </TouchableOpacity>
      </View>

      <View style={styles.onglets}>
        {ONGLETS.map((cle) => (
          <TouchableOpacity key={cle} style={styles.onglet} onPress={() => setOnglet(cle)}>
            <Text style={[styles.ongletTexte, onglet === cle && styles.ongletTexteActif]}>
              {t(`priere.${cle}`)}
            </Text>
            {onglet === cle ? <View style={styles.ongletSoulignement} /> : null}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={donnees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: espacement.md, paddingBottom: 140 }}
        renderItem={({ item }) => (
          <View style={styles.carte}>
            <View style={styles.carteEntete}>
              <Text style={styles.auteur}>
                {item.confidentialite === "anonyme" ? t("priere.confidentialiteAnonyme") : item.auteur}
              </Text>
              <View style={[styles.statutPuce, { backgroundColor: COULEUR_STATUT[item.statut] }]}>
                <Text style={styles.statutTexte}>{t(`priere.statut${capitalize(item.statut)}`)}</Text>
              </View>
            </View>
            <Text style={styles.texteDemande}>{item.texte}</Text>
            {item.reponseEquipe ? (
              <View style={styles.reponse}>
                <Text style={styles.reponseLabel}>{t("priere.reponseEquipe")}</Text>
                <Text style={styles.reponseTexte}>{item.reponseEquipe}</Text>
              </View>
            ) : null}
            <TouchableOpacity style={styles.jePrieBouton} onPress={() => jePrie(item.id)}>
              <Ionicons name="hand-left-outline" size={16} color={colors.primaire} />
              <Text style={styles.jePrieTexte}>
                {t("priere.jePrieCettePersonne")} ({item.nombrePersonnesQuiPrient})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

function capitalize(statut: StatutPriere) {
  const cle = statut === "en_priere" ? "EnPriere" : statut === "recue" ? "Recue" : "Traitee";
  return cle;
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  entete: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: espacement.md,
    paddingTop: espacement.md,
  },
  titrePage: { color: colors.texte, fontSize: 22, fontWeight: "800" },
  boutonNouveau: {
    width: 36,
    height: 36,
    borderRadius: rayon.rond,
    backgroundColor: colors.primaire,
    alignItems: "center",
    justifyContent: "center",
  },
  onglets: { flexDirection: "row", paddingHorizontal: espacement.md, marginTop: espacement.md, gap: espacement.lg },
  onglet: { paddingBottom: 8 },
  ongletTexte: { color: colors.texteSecondaire, fontSize: 13, fontWeight: "600" },
  ongletTexteActif: { color: colors.texte },
  ongletSoulignement: { height: 2, backgroundColor: colors.primaire, marginTop: 6, borderRadius: 2 },
  carte: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.md,
    marginBottom: espacement.md,
  },
  carteEntete: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  auteur: { color: colors.texte, fontSize: 13, fontWeight: "600" },
  statutPuce: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: rayon.rond },
  statutTexte: { color: colors.fond, fontSize: 10, fontWeight: "700" },
  texteDemande: { color: colors.texte, fontSize: 14, marginTop: 8, lineHeight: 20 },
  reponse: { marginTop: 10, backgroundColor: colors.fondClair, borderRadius: rayon.sm, padding: espacement.sm },
  reponseLabel: { color: colors.primaire, fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  reponseTexte: { color: colors.texteSecondaire, fontSize: 12, marginTop: 4 },
  jePrieBouton: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  jePrieTexte: { color: colors.primaire, fontSize: 12, fontWeight: "600" },
});
