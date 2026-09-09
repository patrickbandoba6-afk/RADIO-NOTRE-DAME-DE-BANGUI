import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { LiveBadge } from "@/components/LiveBadge";
import { videos } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";

export function VideosScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  return (
    <EcranConteneur defilable={false}>
      <Text style={styles.titrePage}>{t("video.titre")}</Text>
      <Text style={styles.sousTitrePage}>{t("video.sousTitre")}</Text>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: espacement.md, paddingBottom: 140 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.carte}
            onPress={() => navigation.navigate("LecteurVideo", { id: item.id })}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.overlay}>
              {item.estEnDirect ? <LiveBadge /> : null}
            </View>
            <Text style={styles.titreItem}>{item.titre}</Text>
            <Text style={styles.sousTitreItem}>
              {item.estEnDirect ? t("video.direct") : t("video.replay")} ·{" "}
              {Math.round(item.dureeSecondes / 60)} min
            </Text>
          </TouchableOpacity>
        )}
      />
    </EcranConteneur>
  );
}

const styles = StyleSheet.create({
  titrePage: { color: colors.texte, fontSize: 22, fontWeight: "800", paddingHorizontal: espacement.md, paddingTop: espacement.md },
  sousTitrePage: { color: colors.texteSecondaire, fontSize: 13, paddingHorizontal: espacement.md, marginBottom: espacement.sm },
  carte: { marginBottom: espacement.lg },
  image: { width: "100%", height: 180, borderRadius: rayon.lg, backgroundColor: colors.carte },
  overlay: { position: "absolute", top: 10, left: 10 },
  titreItem: { color: colors.texte, fontSize: 15, fontWeight: "700", marginTop: 8 },
  sousTitreItem: { color: colors.texteSecondaire, fontSize: 12, marginTop: 2 },
});
