import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { EtatChargement, EtatVide } from "@/components/EtatsEcran";
import { FiltresPuces, type OptionFiltre } from "@/components/FiltresPuces";
import { useContenu } from "@/hooks/useContenu";
import { formaterDate } from "@/lib/format";
import { chargerAnnonces } from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { Annonce } from "@/types/editorial";

const CATEGORIES: OptionFiltre[] = [
  { cle: "toutes", libelle: "Toutes" },
  { cle: "paroissiale", libelle: "Paroisse" },
  { cle: "diocesaine", libelle: "Diocèse" },
  { cle: "benevolat", libelle: "Bénévolat" },
  { cle: "dons", libelle: "Appel aux dons" },
  { cle: "formation", libelle: "Formation" },
  { cle: "retraite", libelle: "Retraite" },
  { cle: "concert", libelle: "Concert" },
  { cle: "messe", libelle: "Messe" },
  { cle: "jeunesse", libelle: "Jeunesse" },
];

export function AnnoncesScreen() {
  const navigation = useNavigation<any>();
  const [categorie, setCategorie] = useState("toutes");
  const { donnees, chargement } = useContenu<Annonce[]>(chargerAnnonces, []);

  const annonces = useMemo(
    () =>
      categorie === "toutes"
        ? donnees
        : donnees.filter((annonce) => annonce.categorie === categorie),
    [donnees, categorie]
  );

  return (
    <EcranConteneur defilable={false}>
      <Text style={styles.titrePage}>Annonces</Text>
      <Text style={styles.sousTitrePage}>Avis, communiqués et appels de la communauté</Text>
      <FiltresPuces options={CATEGORIES} actif={categorie} onChanger={setCategorie} />

      {chargement ? (
        <EtatChargement />
      ) : annonces.length === 0 ? (
        <EtatVide
          icone="megaphone-outline"
          titre="Aucune annonce"
          description="Aucune annonce publiée dans cette catégorie."
        />
      ) : (
        <FlatList
          data={annonces}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.liste}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.carte}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("DetailAnnonce", { id: item.id })}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
              ) : null}
              <View style={styles.textes}>
                {item.urgente ? <Text style={styles.urgente}>● URGENT</Text> : null}
                <Text style={styles.titre} numberOfLines={2}>
                  {item.titre}
                </Text>
                <Text style={styles.organisateur} numberOfLines={1}>
                  {item.organisateur}
                </Text>
                <Text style={styles.date}>{formaterDate(item.dateDebutISO)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </EcranConteneur>
  );
}

const styles = StyleSheet.create({
  titrePage: {
    color: colors.texte,
    fontSize: 24,
    fontWeight: "800",
    paddingHorizontal: espacement.md,
    paddingTop: espacement.sm,
  },
  sousTitrePage: {
    color: colors.texteSecondaire,
    fontSize: 13,
    paddingHorizontal: espacement.md,
    marginTop: 2,
  },
  liste: { padding: espacement.md, paddingBottom: 150 },
  carte: {
    flexDirection: "row",
    gap: espacement.sm,
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.sm,
    marginBottom: espacement.sm,
    alignItems: "center",
  },
  image: { width: 72, height: 72, borderRadius: rayon.sm, backgroundColor: colors.fondClair },
  textes: { flex: 1 },
  urgente: { color: colors.danger, fontSize: 10, fontWeight: "800" },
  titre: { color: colors.texte, fontSize: 14, fontWeight: "700", lineHeight: 19 },
  organisateur: { color: colors.texteSecondaire, fontSize: 12, marginTop: 3 },
  date: { color: colors.primaire, fontSize: 11, marginTop: 4 },
});
