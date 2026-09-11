import { useNavigation } from "@react-navigation/native";
import React from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { EtatChargement, EtatVide } from "@/components/EtatsEcran";
import { useContenu } from "@/hooks/useContenu";
import { chargerEmissions } from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { EmissionCatalogue } from "@/types/editorial";

export function EmissionsScreen() {
  const navigation = useNavigation<any>();
  const { donnees, chargement } = useContenu<EmissionCatalogue[]>(chargerEmissions, []);

  return (
    <EcranConteneur defilable={false}>
      <Text style={styles.titrePage}>Émissions</Text>
      <Text style={styles.sousTitrePage}>Le catalogue de Radio Notre-Dame</Text>

      {chargement ? (
        <EtatChargement />
      ) : donnees.length === 0 ? (
        <EtatVide icone="radio-outline" titre="Aucune émission publiée" />
      ) : (
        <FlatList
          data={donnees}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.liste}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.carte}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("DetailEmission", { id: item.id })}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.textes}>
                <Text style={styles.nom} numberOfLines={2}>
                  {item.nom}
                </Text>
                <Text style={styles.animateur} numberOfLines={1}>
                  {item.animateur}
                </Text>
                <Text style={styles.horaires} numberOfLines={1}>
                  {item.frequenceDiffusion} · {item.heureDebut} – {item.heureFin}
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
    marginBottom: espacement.sm,
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
  nom: { color: colors.texte, fontSize: 15, fontWeight: "700", lineHeight: 20 },
  animateur: { color: colors.texteSecondaire, fontSize: 12, marginTop: 3 },
  horaires: { color: colors.primaire, fontSize: 11, marginTop: 4 },
});
