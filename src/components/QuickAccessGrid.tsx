import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, espacement, rayon } from "@/theme/colors";

export interface AccesRapideItem {
  cle: string;
  libelle: string;
  icone: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export function QuickAccessGrid({ items }: { items: AccesRapideItem[] }) {
  return (
    <View style={styles.grille}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.cle}
          style={styles.item}
          onPress={item.onPress}
          activeOpacity={0.75}
        >
          <View style={styles.icone}>
            <Ionicons name={item.icone} size={22} color={colors.primaire} />
          </View>
          <Text style={styles.libelle} numberOfLines={1}>
            {item.libelle}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grille: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: espacement.md,
    gap: espacement.sm,
  },
  item: {
    width: "22%",
    alignItems: "center",
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    paddingVertical: espacement.sm,
    marginBottom: espacement.sm,
  },
  icone: {
    width: 40,
    height: 40,
    borderRadius: rayon.rond,
    backgroundColor: colors.fondClair,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  libelle: { color: colors.texte, fontSize: 11, fontWeight: "500" },
});
