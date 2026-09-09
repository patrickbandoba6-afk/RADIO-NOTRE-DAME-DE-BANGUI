import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, espacement } from "@/theme/colors";

interface Props {
  titre: string;
  sousTitre?: string;
  texteAction?: string;
  onAction?: () => void;
}

export function SectionHeader({ titre, sousTitre, texteAction, onAction }: Props) {
  return (
    <View style={styles.conteneur}>
      <View style={styles.textes}>
        <Text style={styles.titre}>{titre}</Text>
        {sousTitre ? <Text style={styles.sousTitre}>{sousTitre}</Text> : null}
      </View>
      {texteAction && onAction ? (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{texteAction}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: espacement.md,
    marginBottom: espacement.sm,
  },
  textes: { flex: 1 },
  titre: { color: colors.texte, fontSize: 20, fontWeight: "700" },
  sousTitre: { color: colors.texteSecondaire, fontSize: 13, marginTop: 2 },
  action: { color: colors.primaire, fontSize: 13, fontWeight: "600" },
});
