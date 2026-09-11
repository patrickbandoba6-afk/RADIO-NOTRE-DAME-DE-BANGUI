import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { useFavoris } from "@/context/FavorisContext";
import { podcasts, predications } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";

export function FavorisScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { favorisParType } = useFavoris();

  const podcastsFavoris = useMemo(() => {
    const ids = favorisParType("podcast");
    return podcasts.filter((p) => ids.includes(p.id));
  }, [favorisParType]);

  const predicationsFavorites = useMemo(() => {
    const ids = favorisParType("predication");
    return predications.filter((p) => ids.includes(p.id));
  }, [favorisParType]);

  const donnees = [
    ...podcastsFavoris.map((p) => ({
      id: p.id,
      titre: p.titre,
      sousTitre: p.animateur,
      imageUrl: p.imageUrl,
      cible: "DetailPodcast" as const,
    })),
    ...predicationsFavorites.map((p) => ({
      id: p.id,
      titre: p.titre,
      sousTitre: p.predicateur,
      imageUrl: p.imageUrl,
      cible: "DetailPredication" as const,
    })),
  ];

  if (donnees.length === 0) {
    return (
      <View style={styles.conteneurVide}>
        <Ionicons name="heart-outline" size={56} color={colors.texteSecondaire} />
        <Text style={styles.texteVide}>{t("favoris.aucunFavori")}</Text>
      </View>
    );
  }

  return (
    <EcranConteneur defilable={false}>
      <FlatList
        data={donnees}
        keyExtractor={(item) => `${item.cible}-${item.id}`}
        contentContainerStyle={{ padding: espacement.md }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.ligne}
            onPress={() =>
              navigation.navigate("PodcastsStack", { screen: item.cible, params: { id: item.id } })
            }
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={{ flex: 1 }}>
              <Text style={styles.titre} numberOfLines={1}>
                {item.titre}
              </Text>
              <Text style={styles.sousTitre} numberOfLines={1}>
                {item.sousTitre}
              </Text>
            </View>
            <Ionicons name="heart" size={18} color={colors.primaire} />
          </TouchableOpacity>
        )}
      />
    </EcranConteneur>
  );
}

const styles = StyleSheet.create({
  conteneurVide: {
    flex: 1,
    backgroundColor: colors.fond,
    alignItems: "center",
    justifyContent: "center",
    gap: espacement.md,
    padding: espacement.lg,
  },
  texteVide: { color: colors.texteSecondaire, fontSize: 14, textAlign: "center" },
  ligne: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.sm,
    marginBottom: espacement.md,
  },
  image: { width: 54, height: 54, borderRadius: rayon.sm },
  titre: { color: colors.texte, fontSize: 14, fontWeight: "600" },
  sousTitre: { color: colors.texteSecondaire, fontSize: 12, marginTop: 2 },
});
