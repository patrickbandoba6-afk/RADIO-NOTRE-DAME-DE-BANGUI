import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EtatChargement } from "@/components/EtatsEcran";
import { useContenu } from "@/hooks/useContenu";
import { chargerLivresBible } from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { LivreBible } from "@/types";

export function BibleLivresScreen() {
  const navigation = useNavigation<any>();
  const { donnees: livres, chargement } = useContenu<LivreBible[]>(chargerLivresBible, []);

  if (chargement) return <EtatChargement />;

  const ancien = livres.filter((l) => l.testament === "ancien" && l.canon !== "annexe");
  const nouveau = livres.filter((l) => l.testament === "nouveau" && l.canon !== "annexe");
  const annexe = livres.filter((l) => l.canon === "annexe");

  function ouvrir(livre: LivreBible) {
    navigation.navigate("BibleChapitre", {
      livreCode: livre.code,
      livreNom: livre.nom,
      nombreChapitres: livre.nombreChapitres,
      chapitre: 1,
    });
  }

  function Groupe({ titre, donnees, note }: { titre: string; donnees: LivreBible[]; note?: string }) {
    if (donnees.length === 0) return null;
    return (
      <View style={styles.groupe}>
        <Text style={styles.titreGroupe}>{titre}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
        <View style={styles.bloc}>
          {donnees.map((livre, index) => (
            <TouchableOpacity
              key={livre.code}
              style={[styles.ligne, index < donnees.length - 1 && styles.ligneBordure]}
              onPress={() => ouvrir(livre)}
            >
              <Text style={styles.nomLivre}>{livre.nom}</Text>
              {livre.canon === "deuterocanonique" ? (
                <Text style={styles.badge}>deutérocanonique</Text>
              ) : null}
              <Ionicons name="chevron-forward" size={16} color={colors.texteSecondaire} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  if (livres.length === 0) {
    return (
      <View style={styles.videConteneur}>
        <Text style={styles.videTexte}>
          La Bible n&apos;est pas encore chargée. Revenez bientôt.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.conteneur} contentContainerStyle={{ padding: espacement.md, paddingBottom: 140 }}>
      <Text style={styles.titrePage}>La Bible</Text>
      <Groupe titre="Ancien Testament" donnees={ancien} />
      <Groupe titre="Nouveau Testament" donnees={nouveau} />
      <Groupe
        titre="Annexe"
        donnees={annexe}
        note="Hors canon catholique — reconnus par certaines Églises orthodoxes uniquement."
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  videConteneur: { flex: 1, backgroundColor: colors.fond, alignItems: "center", justifyContent: "center", padding: espacement.xl },
  videTexte: { color: colors.texteSecondaire, fontSize: 14, textAlign: "center" },
  titrePage: { color: colors.texte, fontSize: 22, fontWeight: "800", marginBottom: espacement.md },
  groupe: { marginBottom: espacement.lg },
  titreGroupe: {
    color: colors.texteSecondaire,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  note: { color: colors.texteSecondaire, fontSize: 11.5, marginBottom: 8, fontStyle: "italic" },
  bloc: { backgroundColor: colors.carte, borderRadius: rayon.md, overflow: "hidden" },
  ligne: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: espacement.md, paddingVertical: 13 },
  ligneBordure: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separateur },
  nomLivre: { flex: 1, color: colors.texte, fontSize: 14.5 },
  badge: {
    color: colors.primaire,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
