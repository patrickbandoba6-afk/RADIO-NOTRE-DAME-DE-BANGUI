import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { EtatChargement, EtatVide } from "@/components/EtatsEcran";
import { usePlayer } from "@/context/PlayerContext";
import { useContenu } from "@/hooks/useContenu";
import { formaterDateCourte, formaterDuree } from "@/lib/format";
import { chargerEmissions, chargerEpisodes } from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { EmissionCatalogue, Episode } from "@/types/editorial";

export function PodcastsScreen() {
  const navigation = useNavigation<any>();
  const { pisteActuelle, enLecture, lirePiste, mettreEnPause, reprendre } = usePlayer();
  const [recherche, setRecherche] = useState("");

  const { donnees: emissions, chargement: chargementEmissions } = useContenu<EmissionCatalogue[]>(
    chargerEmissions,
    []
  );
  const { donnees: episodes, chargement: chargementEpisodes } = useContenu<Episode[]>(
    () => chargerEpisodes(),
    []
  );

  const terme = recherche.trim().toLowerCase();

  const emissionsFiltrees = useMemo(
    () =>
      terme
        ? emissions.filter(
            (e) =>
              e.nom.toLowerCase().includes(terme) ||
              e.animateur.toLowerCase().includes(terme) ||
              e.categorie.toLowerCase().includes(terme)
          )
        : emissions,
    [emissions, terme]
  );

  const episodesFiltres = useMemo(
    () =>
      terme
        ? episodes.filter(
            (e) =>
              e.titre.toLowerCase().includes(terme) ||
              e.animateur.toLowerCase().includes(terme)
          )
        : episodes,
    [episodes, terme]
  );

  function nomEmission(emissionId: string) {
    return emissions.find((e) => e.id === emissionId)?.nom ?? "";
  }

  function lireEpisode(episode: Episode) {
    if (pisteActuelle?.id === episode.id) {
      enLecture ? mettreEnPause() : reprendre();
      return;
    }
    lirePiste({
      type: "podcast",
      id: episode.id,
      titre: episode.titre,
      sousTitre: nomEmission(episode.emissionId) || episode.animateur,
      imageUrl: episode.imageUrl,
      audioUrl: episode.audioUrl,
    });
  }

  const chargement = chargementEmissions || chargementEpisodes;

  return (
    <EcranConteneur defilable={false}>
      <View style={styles.entete}>
        <Text style={styles.titrePage}>Podcasts</Text>
        <View style={styles.champRecherche}>
          <Ionicons name="search" size={18} color={colors.texteSecondaire} />
          <TextInput
            style={styles.input}
            placeholder="Rechercher une émission"
            placeholderTextColor={colors.texteSecondaire}
            value={recherche}
            onChangeText={setRecherche}
          />
          {recherche ? (
            <TouchableOpacity onPress={() => setRecherche("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.texteSecondaire} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {chargement ? (
        <EtatChargement />
      ) : emissionsFiltrees.length === 0 && episodesFiltres.length === 0 ? (
        <EtatVide
          icone="search-outline"
          titre="Aucun résultat"
          description="Essayez un autre nom d'émission ou d'animateur."
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
          {emissionsFiltrees.length > 0 ? (
            <>
              <Text style={styles.titreSection}>Émissions recommandées</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listeHorizontale}
              >
                {emissionsFiltrees.map((emission) => (
                  <TouchableOpacity
                    key={emission.id}
                    style={styles.carteEmission}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate("DetailEmission", { id: emission.id })}
                  >
                    <Image source={{ uri: emission.imageUrl }} style={styles.pochette} />
                    <Text style={styles.nomEmission} numberOfLines={2}>
                      {emission.nom}
                    </Text>
                    <Text style={styles.animateurEmission} numberOfLines={1}>
                      {emission.animateur}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : null}

          {episodesFiltres.length > 0 ? (
            <>
              <Text style={styles.titreSection}>Épisodes récents</Text>
              <View style={styles.grille}>
                {episodesFiltres.map((episode) => {
                  const actif = pisteActuelle?.id === episode.id && enLecture;
                  return (
                    <TouchableOpacity
                      key={episode.id}
                      style={styles.carteEpisode}
                      activeOpacity={0.85}
                      onPress={() => lireEpisode(episode)}
                    >
                      <Image source={{ uri: episode.imageUrl }} style={styles.imageEpisode} />
                      <View style={styles.badgeLecture}>
                        <Ionicons
                          name={actif ? "pause" : "play"}
                          size={14}
                          color={colors.fond}
                        />
                      </View>
                      <Text style={styles.titreEpisode} numberOfLines={2}>
                        {episode.titre}
                      </Text>
                      <Text style={styles.metaEpisode} numberOfLines={1}>
                        {formaterDuree(episode.dureeSecondes)} ·{" "}
                        {formaterDateCourte(episode.datePublication)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}
        </ScrollView>
      )}
    </EcranConteneur>
  );
}

const styles = StyleSheet.create({
  entete: { paddingHorizontal: espacement.md, paddingTop: espacement.sm },
  titrePage: { color: colors.texte, fontSize: 24, fontWeight: "800" },
  champRecherche: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.sm,
    backgroundColor: colors.carte,
    borderRadius: rayon.rond,
    paddingHorizontal: espacement.md,
    paddingVertical: 10,
    marginTop: espacement.sm,
    marginBottom: espacement.sm,
  },
  input: { flex: 1, color: colors.texte, fontSize: 14, padding: 0 },
  titreSection: {
    color: colors.texte,
    fontSize: 18,
    fontWeight: "800",
    paddingHorizontal: espacement.md,
    marginTop: espacement.md,
    marginBottom: espacement.sm,
  },
  listeHorizontale: { paddingHorizontal: espacement.md, gap: espacement.md },
  carteEmission: { width: 148 },
  pochette: {
    width: 148,
    height: 148,
    borderRadius: rayon.md,
    backgroundColor: colors.carte,
  },
  nomEmission: { color: colors.texte, fontSize: 13, fontWeight: "700", marginTop: 8 },
  animateurEmission: { color: colors.texteSecondaire, fontSize: 11, marginTop: 2 },
  grille: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: espacement.md,
    gap: espacement.md,
  },
  carteEpisode: { width: "47%" },
  imageEpisode: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: rayon.md,
    backgroundColor: colors.carte,
  },
  badgeLecture: {
    position: "absolute",
    right: 8,
    top: "42%",
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  titreEpisode: { color: colors.texte, fontSize: 13, fontWeight: "700", marginTop: 8, lineHeight: 18 },
  metaEpisode: { color: colors.texteSecondaire, fontSize: 11, marginTop: 3 },
});
