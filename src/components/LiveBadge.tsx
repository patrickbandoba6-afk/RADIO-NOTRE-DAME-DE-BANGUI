import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { colors, rayon } from "@/theme/colors";

export function LiveBadge() {
  const { t } = useTranslation();
  return (
    <View style={styles.conteneur}>
      <View style={styles.point} />
      <Text style={styles.texte}>{t("commun.direct")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: rayon.rond,
    alignSelf: "flex-start",
    gap: 5,
  },
  point: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.blanc,
  },
  texte: { color: colors.blanc, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
});
