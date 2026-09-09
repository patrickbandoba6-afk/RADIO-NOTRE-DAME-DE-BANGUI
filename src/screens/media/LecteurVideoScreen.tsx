import { useRoute } from "@react-navigation/native";
import { useVideoPlayer, VideoView } from "expo-video";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LiveBadge } from "@/components/LiveBadge";
import { videos } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";

export function LecteurVideoScreen() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const video = videos.find((v) => v.id === route.params.id) ?? videos[0];

  const player = useVideoPlayer(video.videoUrl, (instance) => {
    instance.loop = false;
    instance.play();
  });

  return (
    <ScrollView style={styles.conteneur}>
      <VideoView player={player} style={styles.video} nativeControls contentFit="contain" />
      <View style={styles.infos}>
        {video.estEnDirect ? <LiveBadge /> : null}
        <Text style={styles.titre}>{video.titre}</Text>
        <Text style={styles.sousTitre}>
          {video.estEnDirect ? t("video.direct") : t("video.replay")}
          {video.sousTitresDisponibles ? ` · CC` : ""}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  video: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" },
  infos: { padding: espacement.md, gap: 8 },
  titre: { color: colors.texte, fontSize: 18, fontWeight: "700" },
  sousTitre: { color: colors.texteSecondaire, fontSize: 13 },
});
