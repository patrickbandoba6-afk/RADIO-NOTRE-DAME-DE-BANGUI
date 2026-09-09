import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { usePlayer } from "@/context/PlayerContext";
import { colors, espacement, rayon } from "@/theme/colors";

export function MiniPlayer() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { pisteActuelle, enLecture, enMemoireTampon, enReconnexion, mettreEnPause, reprendre } =
    usePlayer();

  if (!pisteActuelle) return null;

  return (
    <TouchableOpacity
      style={styles.conteneur}
      activeOpacity={0.9}
      onPress={() => navigation.navigate("Direct")}
    >
      <Image source={{ uri: pisteActuelle.imageUrl }} style={styles.image} />
      <View style={styles.textes}>
        <Text style={styles.titre} numberOfLines={1}>
          {pisteActuelle.titre}
        </Text>
        <Text style={styles.sousTitre} numberOfLines={1}>
          {enReconnexion ? t("lecteur.reconnexion") : pisteActuelle.sousTitre}
        </Text>
      </View>
      {enMemoireTampon || enReconnexion ? (
        <ActivityIndicator color={colors.primaire} style={styles.bouton} />
      ) : (
        <TouchableOpacity
          style={styles.bouton}
          onPress={() => (enLecture ? mettreEnPause() : reprendre())}
          hitSlop={10}
        >
          <Ionicons
            name={enLecture ? "pause-circle" : "play-circle"}
            size={36}
            color={colors.primaire}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    position: "absolute",
    left: espacement.sm,
    right: espacement.sm,
    bottom: 84,
    backgroundColor: colors.carte,
    borderRadius: rayon.lg,
    flexDirection: "row",
    alignItems: "center",
    padding: espacement.sm,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  image: { width: 44, height: 44, borderRadius: rayon.sm },
  textes: { flex: 1, marginLeft: espacement.sm },
  titre: { color: colors.texte, fontWeight: "600", fontSize: 13 },
  sousTitre: { color: colors.texteSecondaire, fontSize: 11, marginTop: 2 },
  bouton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
});
