import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, espacement, rayon } from "@/theme/colors";

export function EtatChargement({ texte }: { texte?: string }) {
  return (
    <View style={styles.centre}>
      <ActivityIndicator color={colors.primaire} size="large" />
      {texte ? <Text style={styles.texte}>{texte}</Text> : null}
    </View>
  );
}

export function EtatVide({
  icone = "file-tray-outline",
  titre,
  description,
}: {
  icone?: keyof typeof Ionicons.glyphMap;
  titre: string;
  description?: string;
}) {
  return (
    <View style={styles.centre}>
      <Ionicons name={icone} size={54} color={colors.texteSecondaire} />
      <Text style={styles.titreVide}>{titre}</Text>
      {description ? <Text style={styles.texte}>{description}</Text> : null}
    </View>
  );
}

export function EtatErreur({ onReessayer }: { onReessayer?: () => void }) {
  return (
    <View style={styles.centre}>
      <Ionicons name="cloud-offline-outline" size={54} color={colors.texteSecondaire} />
      <Text style={styles.titreVide}>Contenu indisponible</Text>
      <Text style={styles.texte}>Vérifiez votre connexion et réessayez.</Text>
      {onReessayer ? (
        <TouchableOpacity style={styles.bouton} onPress={onReessayer}>
          <Text style={styles.boutonTexte}>Réessayer</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: espacement.xl,
    gap: espacement.sm,
  },
  titreVide: { color: colors.texte, fontSize: 16, fontWeight: "700", marginTop: espacement.sm },
  texte: { color: colors.texteSecondaire, fontSize: 13, textAlign: "center" },
  bouton: {
    marginTop: espacement.md,
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingHorizontal: espacement.lg,
    paddingVertical: 10,
  },
  boutonTexte: { color: colors.fond, fontWeight: "700" },
});
