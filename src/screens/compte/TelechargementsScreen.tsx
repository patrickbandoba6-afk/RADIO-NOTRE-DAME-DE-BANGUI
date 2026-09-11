import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { useTelechargements } from "@/context/TelechargementsContext";
import { formaterTaille } from "@/lib/telechargements";
import { colors, espacement, rayon } from "@/theme/colors";

export function TelechargementsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { telechargements, supprimer } = useTelechargements();

  const liste = useMemo(
    () => Object.values(telechargements).filter((item) => item.statut === "termine"),
    [telechargements]
  );

  const tailleTotale = useMemo(
    () => liste.reduce((total, item) => total + (item.taille ?? 0), 0),
    [liste]
  );

  if (liste.length === 0) {
    return (
      <View style={styles.conteneurVide}>
        <Ionicons name="download-outline" size={56} color={colors.texteSecondaire} />
        <Text style={styles.texteVide}>{t("telechargements.aucunTelechargement")}</Text>
      </View>
    );
  }

  return (
    <EcranConteneur defilable={false}>
      <Text style={styles.espaceUtilise}>
        {t("telechargements.espaceUtilise", { taille: formaterTaille(tailleTotale) })}
      </Text>
      <FlatList
        data={liste}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: espacement.md, paddingTop: 0 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.ligne}
            onPress={() =>
              navigation.navigate("PodcastsStack", {
                screen: item.type === "predication" ? "DetailPredication" : "DetailPodcast",
                params: { id: item.id },
              })
            }
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={{ flex: 1 }}>
              <Text style={styles.titre} numberOfLines={1}>
                {item.titre}
              </Text>
              <Text style={styles.sousTitre} numberOfLines={1}>
                {item.sousTitre} · {formaterTaille(item.taille ?? 0)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => supprimer(item.id)} style={styles.boutonSupprimer}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
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
  espaceUtilise: {
    color: colors.texteSecondaire,
    fontSize: 12,
    padding: espacement.md,
    paddingBottom: espacement.sm,
  },
  ligne: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.sm,
    marginBottom: espacement.md,
  },
  image: { width: 54, height: 54, borderRadius: rayon.sm },
  titre: { color: colors.texte, fontSize: 14, fontWeight: "600" },
  sousTitre: { color: colors.texteSecondaire, fontSize: 12, marginTop: 2 },
  boutonSupprimer: { padding: espacement.sm },
});
