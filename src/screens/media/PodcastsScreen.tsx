import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { podcasts } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";

const FILTRES = ["Tous", "Par émission", "Par animateur", "Par thème"] as const;

export function PodcastsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [filtreActif, setFiltreActif] = useState<(typeof FILTRES)[number]>("Tous");

  const donnees = useMemo(() => podcasts, [filtreActif]);

  return (
    <EcranConteneur defilable={false}>
      <Text style={styles.titrePage}>{t("podcasts.titre")}</Text>
      <View style={styles.filtres}>
        {FILTRES.map((filtre) => (
          <TouchableOpacity
            key={filtre}
            style={[styles.puce, filtreActif === filtre && styles.puceActive]}
            onPress={() => setFiltreActif(filtre)}
          >
            <Text style={[styles.puceTexte, filtreActif === filtre && styles.puceTexteActif]}>
              {filtre}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={donnees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: espacement.md, paddingBottom: 140 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.ligne}
            onPress={() => navigation.navigate("DetailPodcast", { id: item.id })}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={{ flex: 1 }}>
              <Text style={styles.titreItem} numberOfLines={1}>{item.titre}</Text>
              <Text style={styles.sousTitreItem} numberOfLines={1}>
                {item.animateur} · {item.emission}
              </Text>
              <Text style={styles.duree}>{Math.round(item.dureeSecondes / 60)} min</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </EcranConteneur>
  );
}

const styles = StyleSheet.create({
  titrePage: { color: colors.texte, fontSize: 22, fontWeight: "800", padding: espacement.md, paddingBottom: espacement.sm },
  filtres: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: espacement.md, gap: 8 },
  puce: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: rayon.rond, backgroundColor: colors.carte },
  puceActive: { backgroundColor: colors.primaire },
  puceTexte: { color: colors.texteSecondaire, fontSize: 12 },
  puceTexteActif: { color: colors.fond, fontWeight: "700" },
  ligne: { flexDirection: "row", gap: espacement.sm, marginBottom: espacement.md, alignItems: "center" },
  image: { width: 60, height: 60, borderRadius: rayon.sm },
  titreItem: { color: colors.texte, fontSize: 14, fontWeight: "600" },
  sousTitreItem: { color: colors.texteSecondaire, fontSize: 12, marginTop: 2 },
  duree: { color: colors.primaire, fontSize: 11, marginTop: 4 },
});
