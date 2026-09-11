import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import * as Sharing from "expo-sharing";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFavoris } from "@/context/FavorisContext";
import { usePlayer } from "@/context/PlayerContext";
import { useTelechargements } from "@/context/TelechargementsContext";
import { podcasts } from "@/data/sampleData";
import { alerter } from "@/lib/alerte";
import { colors, espacement, rayon } from "@/theme/colors";

const VITESSES = [0.75, 1, 1.25, 1.5, 2];

export function DetailPodcastScreen() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const podcast = podcasts.find((p) => p.id === route.params.id) ?? podcasts[0];
  const { pisteActuelle, enLecture, lirePiste, mettreEnPause, reprendre, vitesseLecture, definirVitesse } =
    usePlayer();
  const { estFavori, basculerFavori } = useFavoris();
  const {
    estTelecharge,
    progressionDe,
    cheminLocalDe,
    telecharger,
    annuler,
    supprimer,
    erreurWifiRequis,
    effacerErreur,
  } = useTelechargements();

  const favori = estFavori("podcast", podcast.id);
  const telecharge = estTelecharge(podcast.id);
  const progression = progressionDe(podcast.id);
  const enTelechargement = progression > 0 && progression < 1 && !telecharge;

  const estActif = pisteActuelle?.id === podcast.id;

  useEffect(() => {
    if (erreurWifiRequis) {
      alerter(t("commun.erreur") as string, erreurWifiRequis);
      effacerErreur();
    }
  }, [erreurWifiRequis, effacerErreur, t]);

  function basculerLecture() {
    if (estActif) {
      enLecture ? mettreEnPause() : reprendre();
    } else {
      const cheminLocal = cheminLocalDe(podcast.id);
      lirePiste({
        type: "podcast",
        id: podcast.id,
        titre: podcast.titre,
        sousTitre: podcast.animateur,
        imageUrl: podcast.imageUrl,
        audioUrl: cheminLocal ?? podcast.audioUrl,
      });
    }
  }

  function basculerTelechargement() {
    if (telecharge) {
      supprimer(podcast.id);
    } else if (enTelechargement) {
      annuler(podcast.id);
    } else {
      telecharger({
        id: podcast.id,
        type: "podcast",
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
        <TouchableOpacity style={styles.action} onPress={() => basculerFavori("podcast", podcast.id)}>
          <Ionicons name={favori ? "heart" : "heart-outline"} size={20} color={colors.primaire} />
          <Text style={styles.actionTexte}>{t("commun.favoris")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={basculerTelechargement}>
          <Ionicons
            name={
              telecharge ? "checkmark-circle" : enTelechargement ? "close-circle-outline" : "download-outline"
            }
            size={20}
            color={colors.primaire}
          />
          <Text style={styles.actionTexte}>
            {telecharge
              ? t("commun.telecharge")
              : enTelechargement
              ? `${Math.round(progression * 100)}%`
              : t("commun.telecharger")}
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
      {enTelechargement ? (
        <View style={styles.barreProgressionConteneur}>
          <View style={[styles.barreProgression, { width: `${Math.round(progression * 100)}%` }]} />
        </View>
      ) : null}

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
  barreProgressionConteneur: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.carte,
    marginTop: espacement.sm,
    overflow: "hidden",
  },
  barreProgression: { height: "100%", backgroundColor: colors.primaire },
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
