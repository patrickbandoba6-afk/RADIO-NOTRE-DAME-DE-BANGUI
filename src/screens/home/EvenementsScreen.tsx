import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { evenements } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";

export function EvenementsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.conteneur}>
      <Text style={styles.titrePage}>{t("evenements.titre")}</Text>
      <Text style={styles.sousTitrePage}>{t("evenements.sousTitre")}</Text>
      <FlatList
        data={evenements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: espacement.md, paddingBottom: 140 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.carte}
            onPress={() => navigation.navigate("DetailEvenement", { id: item.id })}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.infos}>
              <View style={[styles.modePuce, item.mode === "en_ligne" ? styles.modeEnLigne : styles.modeSurPlace]}>
                <Text style={styles.modeTexte}>
                  {item.mode === "en_ligne" ? t("evenements.enLigne") : t("evenements.surPlace")}
                </Text>
              </View>
              <Text style={styles.titreItem} numberOfLines={2}>{item.titre}</Text>
              <Text style={styles.date}>
                {new Date(item.dateDebutISO).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  titrePage: { color: colors.texte, fontSize: 22, fontWeight: "800", paddingHorizontal: espacement.md, paddingTop: espacement.md },
  sousTitrePage: { color: colors.texteSecondaire, fontSize: 13, paddingHorizontal: espacement.md, marginBottom: espacement.sm },
  carte: { flexDirection: "row", backgroundColor: colors.carte, borderRadius: rayon.md, overflow: "hidden", marginBottom: espacement.md },
  image: { width: 96, height: 96 },
  infos: { flex: 1, padding: espacement.sm, justifyContent: "center", gap: 4 },
  modePuce: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: rayon.rond },
  modeEnLigne: { backgroundColor: colors.accent },
  modeSurPlace: { backgroundColor: colors.primaireSombre },
  modeTexte: { color: colors.blanc, fontSize: 10, fontWeight: "700" },
  titreItem: { color: colors.texte, fontSize: 14, fontWeight: "700" },
  date: { color: colors.texteSecondaire, fontSize: 12 },
});
