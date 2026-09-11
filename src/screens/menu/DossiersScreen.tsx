import React from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { EtatChargement, EtatVide } from "@/components/EtatsEcran";
import { useContenu } from "@/hooks/useContenu";
import { formaterDate } from "@/lib/format";
import { chargerDossiers } from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { Dossier } from "@/types/editorial";

export function DossiersScreen() {
  const { donnees, chargement } = useContenu<Dossier[]>(chargerDossiers, []);

  return (
    <EcranConteneur defilable={false}>
      <Text style={styles.titrePage}>Dossiers</Text>
      <Text style={styles.sousTitrePage}>Nos contenus regroupés par grand sujet</Text>

      {chargement ? (
        <EtatChargement />
      ) : donnees.length === 0 ? (
        <EtatVide icone="albums-outline" titre="Aucun dossier en cours" />
      ) : (
        <FlatList
          data={donnees}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.liste}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.carte} activeOpacity={0.85}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.contenu}>
                <Text style={styles.titre} numberOfLines={2}>
                  {item.titre}
                </Text>
                <Text style={styles.presentation} numberOfLines={3}>
                  {item.presentation}
                </Text>
                <Text style={styles.periode}>
                  Depuis le {formaterDate(item.dateDebutISO)}
                </Text>
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
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    overflow: "hidden",
    marginBottom: espacement.md,
  },
  image: { width: "100%", height: 150, backgroundColor: colors.fondClair },
  contenu: { padding: espacement.md },
  titre: { color: colors.texte, fontSize: 16, fontWeight: "800" },
  presentation: { color: colors.texteSecondaire, fontSize: 13, marginTop: 6, lineHeight: 19 },
  periode: { color: colors.primaire, fontSize: 11, marginTop: espacement.sm },
});
