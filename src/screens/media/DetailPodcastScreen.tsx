import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { usePlayer } from "@/context/PlayerContext";
import { podcasts } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";

const VITESSES = [0.75, 1, 1.25, 1.5, 2];

export function DetailPodcastScreen() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const podcast = podcasts.find((p) => p.id === route.params.id) ?? podcasts[0];
  const { pisteActuelle, enLecture, lirePiste, mettreEnPause, reprendre, vitesseLecture, definirVitesse } =
    usePlayer();
  const [favori, setFavori] = useState(false);
  const [telecharge, setTelecharge] = useState(false);

  const estActif = pisteActuelle?.id === podcast.id;

  function basculerLecture() {
    if (estActif) {
      enLecture ? mettreEnPause() : reprendre();
    } else {
      lirePiste({
        type: "podcast",
        id: podcast.id,
        titre: podcast.titre,
        sousTitre: podcast.animateur,
        imageUrl: podcast.imageUrl,
        audioUrl: podcast.audioUrl,
      });
    }
  }

  return (
    <ScrollView style={styles.conteneur} contentContainerStyle={{ padding: espacement.md, paddingBottom: 140 }}>
      <Image source={{ uri: podcast.imageUrl }} style={styles.image} />
      <Text style={styles.titre}>{podcast.titre}</Text>
      <Text style={styles.sousTitre}>{podcast.animateur} · {podcast.emission}</Text>

      <TouchableOpacity style={styles.boutonLecture} onPress={basculerLecture}>
        <Ionicons name={estActif && enLecture ? "pause" : "play"} size={22} color={colors.fond} />
        <Text style={styles.boutonLectureTexte}>
          {estActif && enLecture ? t("lecteur.pause") : t("podcasts.reprendreLecture")}
        </Text>
      </TouchableOpacity>

      <View style={styles.ligneActions}>
        <TouchableOpacity style={styles.action} onPress={() => setFavori(!favori)}>
          <Ionicons name={favori ? "heart" : "heart-outline"} size={20} color={colors.primaire} />
          <Text style={styles.actionTexte}>{t("commun.favoris")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={() => setTelecharge(!telecharge)}>
          <Ionicons name={telecharge ? "checkmark-circle" : "download-outline"} size={20} color={colors.primaire} />
          <Text style={styles.actionTexte}>
            {telecharge ? t("commun.telecharge") : t("commun.telecharger")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.action}
          onPress={async () => {
            const dispo = await Sharing.isAvailableAsync();
            if (dispo) await Sharing.shareAsync(podcast.audioUrl);
          }}
        >
          <Ionicons name="share-social-outline" size={20} color={colors.primaire} />
          <Text style={styles.actionTexte}>{t("commun.partager")}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitre}>{t("podcasts.vitesseLecture")}</Text>
      <View style={styles.vitesses}>
        {VITESSES.map((v) => (
          <TouchableOpacity
            key={v}
            style={[styles.vitessePuce, vitesseLecture === v && styles.vitessePuceActive]}
            onPress={() => definirVitesse(v)}
          >
            <Text style={[styles.vitesseTexte, vitesseLecture === v && styles.vitesseTexteActif]}>{v}x</Text>
          </TouchableOpacity>
        ))}
      </View>

      {podcast.transcription ? (
        <>
          <Text style={styles.sectionTitre}>{t("podcasts.transcription")}</Text>
          <Text style={styles.transcription}>{podcast.transcription}</Text>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  image: { width: "100%", height: 220, borderRadius: rayon.lg, backgroundColor: colors.carte },
  titre: { color: colors.texte, fontSize: 20, fontWeight: "700", marginTop: espacement.md },
  sousTitre: { color: colors.texteSecondaire, fontSize: 13, marginTop: 4 },
  boutonLecture: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingVertical: 12,
    marginTop: espacement.lg,
  },
  boutonLectureTexte: { color: colors.fond, fontWeight: "700" },
  ligneActions: { flexDirection: "row", justifyContent: "space-around", marginTop: espacement.lg },
  action: { alignItems: "center", gap: 4 },
  actionTexte: { color: colors.texteSecondaire, fontSize: 11 },
  sectionTitre: { color: colors.texte, fontSize: 15, fontWeight: "700", marginTop: espacement.lg, marginBottom: espacement.sm },
  vitesses: { flexDirection: "row", gap: 8 },
  vitessePuce: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: rayon.rond, backgroundColor: colors.carte },
  vitessePuceActive: { backgroundColor: colors.primaire },
  vitesseTexte: { color: colors.texteSecondaire, fontSize: 12 },
  vitesseTexteActif: { color: colors.fond, fontWeight: "700" },
  transcription: { color: colors.texteSecondaire, fontSize: 13, lineHeight: 20 },
});
