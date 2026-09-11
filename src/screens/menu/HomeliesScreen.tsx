import React from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { EtatChargement, EtatVide } from "@/components/EtatsEcran";
import { usePlayer } from "@/context/PlayerContext";
import { useContenu } from "@/hooks/useContenu";
import { formaterDate, formaterDuree } from "@/lib/format";
import { chargerHomelies } from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { Homelie } from "@/types/editorial";

export function HomeliesScreen() {
  const { pisteActuelle, enLecture, lirePiste, mettreEnPause, reprendre } = usePlayer();
  const { donnees, chargement } = useContenu<Homelie[]>(chargerHomelies, []);

  function ecouter(homelie: Homelie) {
    if (!homelie.audioUrl) return;
    if (pisteActuelle?.id === homelie.id) {
      enLecture ? mettreEnPause() : reprendre();
      return;
    }
    lirePiste({
      type: "predication",
      id: homelie.id,
      titre: homelie.titre,
      sousTitre: homelie.celebrant,
      imageUrl: homelie.imageUrl,
      audioUrl: homelie.audioUrl,
    });
  }

  return (
    <EcranConteneur defilable={false}>
      <Text style={styles.titrePage}>Homélies</Text>

      {chargement ? (
        <EtatChargement />
      ) : donnees.length === 0 ? (
        <EtatVide icone="mic-outline" titre="Aucune homélie publiée" />
      ) : (
        <FlatList
          data={donnees}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.liste}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.carte}
              activeOpacity={0.85}
              onPress={() => ecouter(item)}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={{ flex: 1 }}>
                <Text style={styles.titre} numberOfLines={2}>
                  {item.titre}
                </Text>
                <Text style={styles.celebrant} numberOfLines={1}>
                  {item.celebrant}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {item.celebration} · {formaterDate(item.dateISO)}
                  {item.dureeSecondes ? ` · ${formaterDuree(item.dureeSecondes)}` : ""}
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
    paddingBottom: espacement.sm,
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
  image: { width: 66, height: 66, borderRadius: rayon.sm, backgroundColor: colors.fondClair },
  titre: { color: colors.texte, fontSize: 14, fontWeight: "700", lineHeight: 19 },
  celebrant: { color: colors.texteSecondaire, fontSize: 12, marginTop: 3 },
  meta: { color: colors.primaire, fontSize: 11, marginTop: 4 },
});
