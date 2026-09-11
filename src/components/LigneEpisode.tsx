import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formaterDate, formaterDuree } from "@/lib/format";
import { colors, espacement, rayon } from "@/theme/colors";

/** Ligne d'épisode : date, titre, durée et bouton de lecture. */
export function LigneEpisode({
  titre,
  imageUrl,
  dateISO,
  dureeSecondes,
  enLecture,
  onLire,
  onOuvrir,
}: {
  titre: string;
  imageUrl: string;
  dateISO: string;
  dureeSecondes: number;
  enLecture?: boolean;
  onLire: () => void;
  onOuvrir?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.conteneur} onPress={onOuvrir ?? onLire} activeOpacity={0.85}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.textes}>
        <Text style={styles.date}>Épisode du {formaterDate(dateISO)}</Text>
        <Text style={styles.titre} numberOfLines={2}>
          {titre}
        </Text>
        <View style={styles.ligneDuree}>
          <Ionicons name="time-outline" size={12} color={colors.texteSecondaire} />
          <Text style={styles.duree}>{formaterDuree(dureeSecondes)}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onLire} hitSlop={10} style={styles.boutonLecture}>
        <Ionicons
          name={enLecture ? "pause-circle" : "play-circle"}
          size={38}
          color={colors.primaire}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.sm,
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.sm,
    marginBottom: espacement.sm,
  },
  image: { width: 60, height: 60, borderRadius: rayon.sm, backgroundColor: colors.fondClair },
  textes: { flex: 1 },
  date: { color: colors.texteSecondaire, fontSize: 11 },
  titre: { color: colors.texte, fontSize: 14, fontWeight: "700", marginTop: 2, lineHeight: 19 },
  ligneDuree: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  duree: { color: colors.texteSecondaire, fontSize: 11 },
  boutonLecture: { paddingLeft: 4 },
});
