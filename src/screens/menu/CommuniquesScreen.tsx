import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { EtatChargement, EtatVide } from "@/components/EtatsEcran";
import { useContenu } from "@/hooks/useContenu";
import { formaterDate, ouvrirLien, partagerContenu } from "@/lib/format";
import { chargerCommuniques } from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { Communique } from "@/types/editorial";

export function CommuniquesScreen() {
  const { donnees, chargement } = useContenu<Communique[]>(chargerCommuniques, []);

  return (
    <EcranConteneur defilable={false}>
      <Text style={styles.titrePage}>Communiqués</Text>

      {chargement ? (
        <EtatChargement />
      ) : donnees.length === 0 ? (
        <EtatVide icone="document-text-outline" titre="Aucun communiqué" />
      ) : (
        <FlatList
          data={donnees}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.liste}
          renderItem={({ item }) => (
            <View style={styles.carte}>
              <View style={styles.enteteCarte}>
                <Ionicons name="document-text" size={18} color={colors.primaire} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.organisme}>{item.organisme}</Text>
                  <Text style={styles.date}>{formaterDate(item.dateISO)}</Text>
                </View>
              </View>
              <Text style={styles.titre}>{item.titre}</Text>
              <Text style={styles.contenu}>{item.contenu}</Text>
              <View style={styles.actions}>
                {item.documentUrl ? (
                  <TouchableOpacity
                    style={styles.bouton}
                    onPress={() => ouvrirLien(item.documentUrl!)}
                  >
                    <Ionicons name="download-outline" size={16} color={colors.primaire} />
                    <Text style={styles.boutonTexte}>Document</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={styles.bouton}
                  onPress={() => partagerContenu(item.titre, item.contenu)}
                >
                  <Ionicons name="share-social-outline" size={16} color={colors.primaire} />
                  <Text style={styles.boutonTexte}>Partager</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </EcranConteneur>
  );
}

const styles = StyleSheet.create({
  titrePage: {
    color: colors.texte,
    fontSize: 24,
    fontWeight: "800",
    paddingHorizontal: espacement.md,
    paddingTop: espacement.sm,
    paddingBottom: espacement.sm,
  },
  liste: { padding: espacement.md, paddingBottom: 150 },
  carte: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.md,
    marginBottom: espacement.md,
  },
  enteteCarte: { flexDirection: "row", alignItems: "center", gap: espacement.sm },
  organisme: { color: colors.texte, fontSize: 13, fontWeight: "700" },
  date: { color: colors.texteSecondaire, fontSize: 11, marginTop: 1 },
  titre: { color: colors.texte, fontSize: 15, fontWeight: "700", marginTop: espacement.sm },
  contenu: { color: colors.texteSecondaire, fontSize: 13, lineHeight: 20, marginTop: 6 },
  actions: { flexDirection: "row", gap: espacement.md, marginTop: espacement.md },
  bouton: { flexDirection: "row", alignItems: "center", gap: 5 },
  boutonTexte: { color: colors.primaire, fontSize: 12, fontWeight: "600" },
});
