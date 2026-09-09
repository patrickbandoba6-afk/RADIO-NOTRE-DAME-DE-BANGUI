import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { predications } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";

export function PredicationsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  return (
    <EcranConteneur defilable={false}>
      <Text style={styles.titrePage}>{t("predications.titre")}</Text>
      <FlatList
        data={predications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: espacement.md, paddingBottom: 140 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.ligne}
            onPress={() => navigation.navigate("DetailPredication", { id: item.id })}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <>
              <Text style={styles.titreItem} numberOfLines={1}>{item.titre}</Text>
              <Text style={styles.sousTitreItem} numberOfLines={1}>
                {item.predicateur} · {item.serie}
              </Text>
              {item.verset ? <Text style={styles.verset}>{item.verset}</Text> : null}
            </>
          </TouchableOpacity>
        )}
      />
    </EcranConteneur>
  );
}

const styles = StyleSheet.create({
  titrePage: { color: colors.texte, fontSize: 22, fontWeight: "800", padding: espacement.md, paddingBottom: espacement.sm },
  ligne: { flexDirection: "row", gap: espacement.sm, marginBottom: espacement.md, alignItems: "center" },
  image: { width: 64, height: 64, borderRadius: rayon.sm },
  titreItem: { color: colors.texte, fontSize: 14, fontWeight: "600" },
  sousTitreItem: { color: colors.texteSecondaire, fontSize: 12, marginTop: 2 },
  verset: { color: colors.primaire, fontSize: 11, marginTop: 4 },
});
