import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, espacement, rayon } from "@/theme/colors";

interface Props {
  titre: string;
  sousTitre?: string;
  imageUrl: string;
  onPress?: () => void;
  largeur?: number;
  icone?: keyof typeof Ionicons.glyphMap;
}

export function ContentCard({ titre, sousTitre, imageUrl, onPress, largeur = 160, icone = "play-circle" }: Props) {
  return (
    <TouchableOpacity
      style={[styles.conteneur, { width: largeur }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View>
        <Image source={{ uri: imageUrl }} style={[styles.image, { width: largeur, height: largeur }]} />
        <View style={styles.icone}>
          <Ionicons name={icone} size={22} color={colors.blanc} />
        </View>
      </View>
      <Text style={styles.titre} numberOfLines={2}>
        {titre}
      </Text>
      {sousTitre ? (
        <Text style={styles.sousTitre} numberOfLines={1}>
          {sousTitre}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  conteneur: { marginRight: espacement.md },
  image: { borderRadius: rayon.md, backgroundColor: colors.carte },
  icone: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(11,31,58,0.75)",
    borderRadius: rayon.rond,
    padding: 4,
  },
  titre: { color: colors.texte, fontSize: 13, fontWeight: "600", marginTop: 8 },
  sousTitre: { color: colors.texteSecondaire, fontSize: 12, marginTop: 2 },
});
