import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { evenements, podcasts, predications, videos } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";

type ResultatRecherche = {
  id: string;
  titre: string;
  sousTitre: string;
  imageUrl: string;
  type: "podcast" | "predication" | "video" | "evenement";
};

function construireIndex(): ResultatRecherche[] {
  return [
    ...podcasts.map((p) => ({ id: p.id, titre: p.titre, sousTitre: p.animateur, imageUrl: p.imageUrl, type: "podcast" as const })),
    ...predications.map((p) => ({ id: p.id, titre: p.titre, sousTitre: p.predicateur, imageUrl: p.imageUrl, type: "predication" as const })),
    ...videos.map((v) => ({ id: v.id, titre: v.titre, sousTitre: v.categorie, imageUrl: v.imageUrl, type: "video" as const })),
    ...evenements.map((e) => ({ id: e.id, titre: e.titre, sousTitre: e.mode, imageUrl: e.imageUrl, type: "evenement" as const })),
  ];
}

const INDEX = construireIndex();

export function RechercheScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [requete, setRequete] = useState("");

  const resultats = useMemo(() => {
    if (!requete.trim()) return [];
    const q = requete.toLowerCase();
    return INDEX.filter(
      (item) => item.titre.toLowerCase().includes(q) || item.sousTitre.toLowerCase().includes(q)
    );
  }, [requete]);

  function ouvrir(item: ResultatRecherche) {
    switch (item.type) {
      case "podcast":
        navigation.navigate("PodcastsStack", { screen: "DetailPodcast", params: { id: item.id } });
        break;
      case "predication":
        navigation.navigate("PodcastsStack", { screen: "DetailPredication", params: { id: item.id } });
        break;
      case "video":
        navigation.navigate("PodcastsStack", { screen: "LecteurVideo", params: { id: item.id } });
        break;
      case "evenement":
        navigation.navigate("DetailEvenement", { id: item.id });
        break;
    }
  }

  return (
    <View style={styles.conteneur}>
      <Text style={styles.titrePage}>{t("recherche.titre")}</Text>
      <View style={styles.zoneRecherche}>
        <Ionicons name="search" size={16} color={colors.texteSecondaire} />
        <TextInput
          style={styles.input}
          placeholder={t("recherche.placeholder") as string}
          placeholderTextColor={colors.texteSecondaire}
          value={requete}
          onChangeText={setRequete}
          autoFocus
        />
      </View>

      <FlatList
        data={resultats}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={{ padding: espacement.md, paddingBottom: 140 }}
        ListEmptyComponent={
          requete.trim() ? (
            <Text style={styles.videMessage}>{t("recherche.aucunResultat")}</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.ligne} onPress={() => ouvrir(item)}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View>
              <Text style={styles.titreItem}>{item.titre}</Text>
              <Text style={styles.sousTitreItem}>{item.sousTitre}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  titrePage: { color: colors.texte, fontSize: 22, fontWeight: "800", paddingHorizontal: espacement.md, paddingTop: espacement.md },
  zoneRecherche: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.carte,
    marginHorizontal: espacement.md,
    marginTop: espacement.md,
    borderRadius: rayon.md,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: { flex: 1, color: colors.texte, paddingVertical: 10 },
  videMessage: { color: colors.texteSecondaire, textAlign: "center", marginTop: espacement.xl },
  ligne: { flexDirection: "row", gap: espacement.sm, alignItems: "center", marginBottom: espacement.md },
  image: { width: 48, height: 48, borderRadius: rayon.sm },
  titreItem: { color: colors.texte, fontSize: 14, fontWeight: "600" },
  sousTitreItem: { color: colors.texteSecondaire, fontSize: 12, marginTop: 2, textTransform: "capitalize" },
});
