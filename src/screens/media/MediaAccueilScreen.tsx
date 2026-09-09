import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ContentCard } from "@/components/ContentCard";
import { EcranConteneur } from "@/components/EcranConteneur";
import { SectionHeader } from "@/components/SectionHeader";
import { podcasts, predications, videos } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";

export function MediaAccueilScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  return (
    <EcranConteneur>
      <Text style={styles.titrePage}>{t("onglets.media")}</Text>

      <SectionHeader
        titre={t("video.titre")}
        sousTitre={t("video.sousTitre")}
        texteAction={t("commun.voirTout")}
        onAction={() => navigation.navigate("Videos")}
      />
      <View style={styles.listeHorizontale}>
        {videos.map((v) => (
          <ContentCard
            key={v.id}
            titre={v.titre}
            sousTitre={v.estEnDirect ? t("video.direct") : t("video.replay")}
            imageUrl={v.imageUrl}
            largeur={200}
            icone="videocam"
            onPress={() => navigation.navigate("LecteurVideo", { id: v.id })}
          />
        ))}
      </View>

      <SectionHeader
        titre={t("podcasts.titre")}
        sousTitre={t("podcasts.sousTitre")}
        texteAction={t("commun.voirTout")}
        onAction={() => navigation.navigate("Podcasts")}
      />
      <View style={styles.listeHorizontale}>
        {podcasts.map((p) => (
          <ContentCard
            key={p.id}
            titre={p.titre}
            sousTitre={p.animateur}
            imageUrl={p.imageUrl}
            onPress={() => navigation.navigate("DetailPodcast", { id: p.id })}
          />
        ))}
      </View>

      <SectionHeader
        titre={t("predications.titre")}
        sousTitre={t("predications.sousTitre")}
        texteAction={t("commun.voirTout")}
        onAction={() => navigation.navigate("Predications")}
      />
      <View style={styles.listeHorizontale}>
        {predications.map((p) => (
          <ContentCard
            key={p.id}
            titre={p.titre}
            sousTitre={p.predicateur}
            imageUrl={p.imageUrl}
            onPress={() => navigation.navigate("DetailPredication", { id: p.id })}
          />
        ))}
      </View>
    </EcranConteneur>
  );
}

const styles = StyleSheet.create({
  titrePage: {
    color: colors.texte,
    fontSize: 26,
    fontWeight: "800",
    paddingHorizontal: espacement.md,
    marginBottom: espacement.md,
  },
  listeHorizontale: { flexDirection: "row", paddingHorizontal: espacement.md, marginBottom: espacement.lg },
});
