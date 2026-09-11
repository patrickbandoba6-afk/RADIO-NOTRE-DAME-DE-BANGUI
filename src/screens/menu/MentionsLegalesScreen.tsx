import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { documentsLegaux } from "@/data/legal";
import { colors, espacement, rayon } from "@/theme/colors";

export function MentionsLegalesScreen() {
  const [cleActive, setCleActive] = useState(documentsLegaux[0].cle);
  const document = documentsLegaux.find((d) => d.cle === cleActive) ?? documentsLegaux[0];

  return (
    <View style={styles.conteneur}>
      <View style={styles.puces}>
        {documentsLegaux.map((doc) => (
          <TouchableOpacity
            key={doc.cle}
            style={[styles.puce, cleActive === doc.cle && styles.puceActive]}
            onPress={() => setCleActive(doc.cle)}
          >
            <Text style={[styles.puceTexte, cleActive === doc.cle && styles.puceTexteActif]}>
              {doc.titre}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.conteneurScroll}
        contentContainerStyle={{ padding: espacement.md, paddingBottom: 150 }}
      >
        <Text style={styles.titreDocument}>{document.titre}</Text>
        <Text style={styles.miseAJour}>{document.miseAJour}</Text>

        {document.sections.map((section) => (
          <View key={section.titre} style={styles.section}>
            <Text style={styles.titreSection}>{section.titre}</Text>
            {section.paragraphes.map((paragraphe, index) => (
              <Text key={index} style={styles.paragraphe}>
                {paragraphe}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  puces: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    padding: espacement.md,
    paddingBottom: espacement.sm,
  },
  puce: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: rayon.rond,
    backgroundColor: colors.carte,
  },
  puceActive: { backgroundColor: colors.primaire },
  puceTexte: { color: colors.texteSecondaire, fontSize: 12, fontWeight: "600" },
  puceTexteActif: { color: colors.fond, fontWeight: "700" },
  conteneurScroll: { flex: 1 },
  titreDocument: { color: colors.texte, fontSize: 20, fontWeight: "800" },
  miseAJour: { color: colors.texteSecondaire, fontSize: 12, marginTop: 4, marginBottom: espacement.lg },
  section: { marginBottom: espacement.lg },
  titreSection: { color: colors.primaire, fontSize: 14, fontWeight: "700", marginBottom: espacement.sm },
  paragraphe: { color: colors.texte, fontSize: 13, lineHeight: 20, marginBottom: espacement.sm },
});
