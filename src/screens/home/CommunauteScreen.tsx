import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { groupesCommunaute } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";

export function CommunauteScreen() {
  const { t } = useTranslation();
  const [groupesRejoints, setGroupesRejoints] = useState<string[]>([]);

  function basculerGroupe(id: string) {
    setGroupesRejoints((precedent) =>
      precedent.includes(id) ? precedent.filter((g) => g !== id) : [...precedent, id]
    );
  }

  return (
    <View style={styles.conteneur}>
      <Text style={styles.titrePage}>{t("communaute.titre")}</Text>
      <Text style={styles.sousTitrePage}>{t("communaute.sousTitre")}</Text>
      <FlatList
        data={groupesCommunaute}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: espacement.md, paddingBottom: 140 }}
        renderItem={({ item }) => {
          const rejoint = groupesRejoints.includes(item.id);
          return (
            <View style={styles.carte}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={{ flex: 1 }}>
                <Text style={styles.nom}>{item.nom}</Text>
                <Text style={styles.membres}>
                  {item.membres.toLocaleString("fr-FR")} membres
                </Text>
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.boutonRejoindre, rejoint && styles.boutonRejoint]}
                onPress={() => basculerGroupe(item.id)}
              >
                <Text style={[styles.boutonTexte, rejoint && styles.boutonTexteRejoint]}>
                  {rejoint ? "✓" : t("communaute.rejoindre")}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  titrePage: { color: colors.texte, fontSize: 22, fontWeight: "800", paddingHorizontal: espacement.md, paddingTop: espacement.md },
  sousTitrePage: { color: colors.texteSecondaire, fontSize: 13, paddingHorizontal: espacement.md, marginBottom: espacement.sm },
  carte: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.sm,
    marginBottom: espacement.md,
    gap: espacement.sm,
  },
  image: { width: 52, height: 52, borderRadius: rayon.rond },
  nom: { color: colors.texte, fontSize: 14, fontWeight: "700" },
  membres: { color: colors.primaire, fontSize: 11, marginTop: 2 },
  description: { color: colors.texteSecondaire, fontSize: 11, marginTop: 4 },
  boutonRejoindre: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: rayon.rond, backgroundColor: colors.primaire },
  boutonRejoint: { backgroundColor: colors.succes },
  boutonTexte: { color: colors.fond, fontSize: 11, fontWeight: "700" },
  boutonTexteRejoint: { color: colors.blanc },
});
