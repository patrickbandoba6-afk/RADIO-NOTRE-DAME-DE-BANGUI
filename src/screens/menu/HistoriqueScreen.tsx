import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { EtatVide } from "@/components/EtatsEcran";
import { useHistorique } from "@/context/HistoriqueContext";
import { formaterDateRelative } from "@/lib/format";
import { colors, espacement, rayon } from "@/theme/colors";
import type { TypeContenu } from "@/types/editorial";

const ICONES: Partial<Record<TypeContenu, keyof typeof Ionicons.glyphMap>> = {
  article: "newspaper-outline",
  annonce: "megaphone-outline",
  episode: "mic-outline",
  podcast: "headset-outline",
  predication: "book-outline",
  emission: "radio-outline",
  priere: "heart-outline",
  evenement: "calendar-outline",
};

export function HistoriqueScreen() {
  const navigation = useNavigation<any>();
  const { historique, viderHistorique } = useHistorique();

  if (historique.length === 0) {
    return (
      <EtatVide
        icone="time-outline"
        titre="Historique vide"
        description="Les contenus que vous consultez apparaîtront ici."
      />
    );
  }

  function ouvrir(type: TypeContenu, id: string) {
    if (type === "article") navigation.navigate("ActualitesStack", { screen: "Article", params: { id } });
    else if (type === "annonce") navigation.navigate("AgendaStack", { screen: "DetailAnnonce", params: { id } });
    else if (type === "emission") navigation.navigate("PodcastsStack", { screen: "DetailEmission", params: { id } });
  }

  return (
    <EcranConteneur defilable={false}>
      <View style={styles.entete}>
        <Text style={styles.titrePage}>Mon historique</Text>
        <TouchableOpacity onPress={viderHistorique} hitSlop={8}>
          <Text style={styles.vider}>Vider</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={historique}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.liste}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.ligne} onPress={() => ouvrir(item.type, item.id)}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <Ionicons
                  name={ICONES[item.type] ?? "document-outline"}
                  size={20}
                  color={colors.texteSecondaire}
                />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.titre} numberOfLines={2}>
                {item.titre}
              </Text>
              <Text style={styles.date}>{formaterDateRelative(item.consulteLeISO)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </EcranConteneur>
  );
}

const styles = StyleSheet.create({
  entete: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: espacement.md,
    paddingTop: espacement.sm,
  },
  titrePage: { color: colors.texte, fontSize: 22, fontWeight: "800" },
  vider: { color: colors.danger, fontSize: 13, fontWeight: "600" },
  liste: { padding: espacement.md, paddingBottom: 150 },
  ligne: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.sm,
    marginBottom: espacement.md,
  },
  image: { width: 54, height: 54, borderRadius: rayon.sm, backgroundColor: colors.carte },
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  titre: { color: colors.texte, fontSize: 14, fontWeight: "600", lineHeight: 19 },
  date: { color: colors.texteSecondaire, fontSize: 11, marginTop: 3 },
});
