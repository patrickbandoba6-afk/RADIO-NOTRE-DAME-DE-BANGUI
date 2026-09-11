import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EtatChargement, EtatVide } from "@/components/EtatsEcran";
import { LigneEpisode } from "@/components/LigneEpisode";
import { useFavoris } from "@/context/FavorisContext";
import { usePlayer } from "@/context/PlayerContext";
import { useContenu } from "@/hooks/useContenu";
import { partagerContenu } from "@/lib/format";
import { chargerEmissions, chargerEpisodes } from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { EmissionCatalogue, Episode } from "@/types/editorial";

export function DetailEmissionScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const id: string = route.params.id;
  const { estFavori, basculerFavori } = useFavoris();
  const { pisteActuelle, enLecture, lirePiste, mettreEnPause, reprendre } = usePlayer();
  const [descriptionDepliee, setDescriptionDepliee] = useState(false);

  const { donnees: emissions, chargement: chargementEmission } = useContenu<EmissionCatalogue[]>(
    chargerEmissions,
    []
  );
  const { donnees: episodes, chargement: chargementEpisodes } = useContenu<Episode[]>(
    () => chargerEpisodes(id),
    [],
    [id]
  );

  const emission = emissions.find((e) => e.id === id);

  if (chargementEmission) return <EtatChargement />;
  if (!emission) {
    return <EtatVide icone="radio-outline" titre="Émission introuvable" />;
  }

  const favori = estFavori("emission", emission.id);

  function lireEpisode(episode: Episode) {
    const estActif = pisteActuelle?.id === episode.id;
    if (estActif) {
      enLecture ? mettreEnPause() : reprendre();
      return;
    }
    lirePiste({
      type: "podcast",
      id: episode.id,
      titre: episode.titre,
      sousTitre: emission!.nom,
      imageUrl: episode.imageUrl || emission!.imageUrl,
      audioUrl: episode.audioUrl,
    });
  }

  return (
    <ScrollView style={styles.conteneur} contentContainerStyle={{ paddingBottom: 150 }}>
      <LinearGradient colors={[colors.carte, colors.fond]} style={styles.entete}>
        <View style={styles.enteteBarre}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.rond}>
            <Ionicons name="chevron-back" size={22} color={colors.texte} />
          </TouchableOpacity>
          <View style={styles.enteteActions}>
            <TouchableOpacity
              onPress={() => partagerContenu(emission.nom, emission.description)}
              hitSlop={10}
              style={styles.rond}
            >
              <Ionicons name="share-social-outline" size={19} color={colors.texte} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => basculerFavori("emission", emission.id)}
              hitSlop={10}
              style={styles.rond}
            >
              <Ionicons
                name={favori ? "heart" : "heart-outline"}
                size={19}
                color={favori ? colors.primaire : colors.texte}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.enteteContenu}>
          <Image source={{ uri: emission.imageUrl }} style={styles.pochette} />
          <View style={styles.enteteTextes}>
            <Text style={styles.nom} numberOfLines={3}>
              {emission.nom}
            </Text>
            <Text style={styles.animateur} numberOfLines={2}>
              présentée par {emission.animateur}
            </Text>
            {emission.frequenceDiffusion ? (
              <Text style={styles.diffusion}>
                {emission.frequenceDiffusion} · {emission.heureDebut} – {emission.heureFin}
              </Text>
            ) : null}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.corps}>
        <Text style={styles.description} numberOfLines={descriptionDepliee ? undefined : 3}>
          {emission.description}
        </Text>
        {emission.description.length > 140 ? (
          <TouchableOpacity onPress={() => setDescriptionDepliee(!descriptionDepliee)}>
            <Text style={styles.voirPlus}>
              {descriptionDepliee ? "Voir moins" : "Voir plus"}
            </Text>
          </TouchableOpacity>
        ) : null}

        {emission.chroniqueurs.length > 0 ? (
          <Text style={styles.chroniqueurs}>
            Avec {emission.chroniqueurs.join(", ")}
          </Text>
        ) : null}

        <Text style={styles.titreSection}>Les dernières émissions</Text>

        {chargementEpisodes ? (
          <EtatChargement />
        ) : episodes.length === 0 ? (
          <EtatVide
            icone="mic-outline"
            titre="Aucun épisode"
            description="Les épisodes de cette émission seront bientôt disponibles."
          />
        ) : (
          episodes.map((episode) => (
            <LigneEpisode
              key={episode.id}
              titre={episode.titre}
              imageUrl={episode.imageUrl || emission.imageUrl}
              dateISO={episode.datePublication}
              dureeSecondes={episode.dureeSecondes}
              enLecture={pisteActuelle?.id === episode.id && enLecture}
              onLire={() => lireEpisode(episode)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  entete: { paddingTop: 48, paddingHorizontal: espacement.md, paddingBottom: espacement.lg },
  enteteBarre: { flexDirection: "row", justifyContent: "space-between" },
  enteteActions: { flexDirection: "row", gap: espacement.sm },
  rond: {
    width: 38,
    height: 38,
    borderRadius: rayon.rond,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  enteteContenu: { flexDirection: "row", gap: espacement.md, marginTop: espacement.md },
  pochette: { width: 108, height: 108, borderRadius: rayon.md, backgroundColor: colors.fondClair },
  enteteTextes: { flex: 1, justifyContent: "center" },
  nom: { color: colors.texte, fontSize: 21, fontWeight: "800", lineHeight: 27 },
  animateur: { color: colors.texteSecondaire, fontSize: 14, marginTop: 4 },
  diffusion: { color: colors.primaire, fontSize: 12, marginTop: 6, fontWeight: "600" },
  corps: { padding: espacement.md },
  description: { color: colors.texte, fontSize: 14, lineHeight: 21 },
  voirPlus: { color: colors.primaire, fontSize: 13, fontWeight: "700", marginTop: 6 },
  chroniqueurs: { color: colors.texteSecondaire, fontSize: 13, marginTop: espacement.sm },
  titreSection: {
    color: colors.texte,
    fontSize: 19,
    fontWeight: "800",
    marginTop: espacement.lg,
    marginBottom: espacement.md,
  },
});
