import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors, espacement, rayon } from "@/theme/colors";

export interface OptionFiltre {
  cle: string;
  libelle: string;
}

/** Barre horizontale de filtres (rubriques, périodes, catégories…). */
export function FiltresPuces({
  options,
  actif,
  onChanger,
}: {
  options: OptionFiltre[];
  actif: string;
  onChanger: (cle: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.conteneur}
    >
      {options.map((option) => {
        const estActif = option.cle === actif;
        return (
          <TouchableOpacity
            key={option.cle}
            style={[styles.puce, estActif && styles.puceActive]}
            onPress={() => onChanger(option.cle)}
            activeOpacity={0.8}
          >
            <Text style={[styles.texte, estActif && styles.texteActif]}>{option.libelle}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { paddingHorizontal: espacement.md, gap: 8, paddingVertical: espacement.sm },
  puce: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: rayon.rond,
    backgroundColor: colors.carte,
  },
  puceActive: { backgroundColor: colors.primaire },
  texte: { color: colors.texteSecondaire, fontSize: 12, fontWeight: "600" },
  texteActif: { color: colors.fond, fontWeight: "800" },
});
