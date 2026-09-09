import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { temoignages } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";

export function TemoignagesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.conteneur}>
      <View style={styles.entete}>
        <View>
          <Text style={styles.titrePage}>{t("temoignages.titre")}</Text>
          <Text style={styles.sousTitrePage}>{t("temoignages.sousTitre")}</Text>
        </View>
        <TouchableOpacity
          style={styles.boutonNouveau}
          onPress={() => navigation.navigate("NouveauTemoignage")}
        >
          <Ionicons name="add" size={22} color={colors.fond} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={temoignages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: espacement.md, paddingBottom: 140 }}
        renderItem={({ item }) => (
          <View style={styles.carte}>
            <Text style={styles.auteur}>
              {item.auteur} · {item.pays}
            </Text>
            <Text style={styles.contenu}>{item.contenu}</Text>
            <View style={styles.piedCarte}>
              <Text style={styles.categorie}>{item.categorie}</Text>
              <TouchableOpacity style={styles.signaler}>
                <Ionicons name="flag-outline" size={14} color={colors.texteSecondaire} />
                <Text style={styles.signalerTexte}>{t("temoignages.signaler")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  entete: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: espacement.md,
    paddingTop: espacement.md,
  },
  titrePage: { color: colors.texte, fontSize: 22, fontWeight: "800" },
  sousTitrePage: { color: colors.texteSecondaire, fontSize: 13, marginTop: 4 },
  boutonNouveau: {
    width: 36,
    height: 36,
    borderRadius: rayon.rond,
    backgroundColor: colors.primaire,
    alignItems: "center",
    justifyContent: "center",
  },
  carte: { backgroundColor: colors.carte, borderRadius: rayon.md, padding: espacement.md, marginBottom: espacement.md },
  auteur: { color: colors.primaire, fontSize: 12, fontWeight: "700" },
  contenu: { color: colors.texte, fontSize: 14, marginTop: 8, lineHeight: 20 },
  piedCarte: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  categorie: { color: colors.texteSecondaire, fontSize: 11 },
  signaler: { flexDirection: "row", alignItems: "center", gap: 4 },
  signalerTexte: { color: colors.texteSecondaire, fontSize: 11 },
});
