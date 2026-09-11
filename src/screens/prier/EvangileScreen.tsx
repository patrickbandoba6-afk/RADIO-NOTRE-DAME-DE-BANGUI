import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EtatChargement } from "@/components/EtatsEcran";
import { usePlayer } from "@/context/PlayerContext";
import { useContenu } from "@/hooks/useContenu";
import { formaterDate, partagerContenu } from "@/lib/format";
import { chargerEvangileDuJour } from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { EvangileDuJour } from "@/types/editorial";

export function EvangileScreen() {
  const { lirePiste } = usePlayer();
  const { donnees, chargement } = useContenu<EvangileDuJour | null>(
    chargerEvangileDuJour,
    null
  );

  if (chargement) return <EtatChargement />;
  if (!donnees) return null;

  const evangile = donnees;

  return (
    <ScrollView style={styles.conteneur} contentContainerStyle={{ padding: espacement.md, paddingBottom: 150 }}>
      <Text style={styles.date}>{formaterDate(evangile.date)}</Text>
      <Text style={styles.titrePage}>Évangile du jour</Text>
      {evangile.saintDuJour ? (
        <View style={styles.puceSaint}>
          <Ionicons name="star" size={12} color={colors.primaire} />
          <Text style={styles.saint}>{evangile.saintDuJour}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        {evangile.audioUrl ? (
          <TouchableOpacity
            style={styles.boutonEcouter}
            onPress={() =>
              lirePiste({
                type: "predication",
                id: `evangile-${evangile.id}`,
                titre: "Évangile du jour",
                sousTitre: evangile.evangile.reference,
                imageUrl: "https://picsum.photos/seed/evangile/600/600",
                audioUrl: evangile.audioUrl!,
              })
            }
          >
            <Ionicons name="play" size={18} color={colors.fond} />
            <Text style={styles.boutonEcouterTexte}>Écouter</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={styles.boutonSecondaire}
          onPress={() =>
            partagerContenu(evangile.evangile.reference, evangile.evangile.texte)
          }
        >
          <Ionicons name="share-social-outline" size={18} color={colors.primaire} />
          <Text style={styles.boutonSecondaireTexte}>Partager</Text>
        </TouchableOpacity>
      </View>

      {evangile.premiereLecture ? (
        <BlocLecture
          etiquette="Première lecture"
          reference={evangile.premiereLecture.reference}
          texte={evangile.premiereLecture.texte}
        />
      ) : null}
      {evangile.psaume ? (
        <BlocLecture
          etiquette="Psaume"
          reference={evangile.psaume.reference}
          texte={evangile.psaume.texte}
        />
      ) : null}
      {evangile.deuxiemeLecture ? (
        <BlocLecture
          etiquette="Deuxième lecture"
          reference={evangile.deuxiemeLecture.reference}
          texte={evangile.deuxiemeLecture.texte}
        />
      ) : null}

      <View style={styles.blocEvangile}>
        <Text style={styles.etiquetteEvangile}>Évangile</Text>
        <Text style={styles.reference}>{evangile.evangile.reference}</Text>
        <Text style={styles.texteEvangile}>{evangile.evangile.texte}</Text>
      </View>

      {evangile.meditation ? (
        <View style={styles.blocMeditation}>
          <Text style={styles.titreMeditation}>Méditation</Text>
          <Text style={styles.texteMeditation}>{evangile.meditation}</Text>
        </View>
      ) : null}

      {evangile.commentaire ? (
        <View style={styles.blocMeditation}>
          <Text style={styles.titreMeditation}>Commentaire</Text>
          <Text style={styles.texteMeditation}>{evangile.commentaire}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function BlocLecture({
  etiquette,
  reference,
  texte,
}: {
  etiquette: string;
  reference: string;
  texte: string;
}) {
  return (
    <View style={styles.blocLecture}>
      <Text style={styles.etiquette}>{etiquette}</Text>
      <Text style={styles.reference}>{reference}</Text>
      <Text style={styles.texteLecture}>{texte}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  date: { color: colors.texteSecondaire, fontSize: 12, textTransform: "capitalize" },
  titrePage: { color: colors.texte, fontSize: 26, fontWeight: "800", marginTop: 4 },
  puceSaint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: espacement.sm,
  },
  saint: { color: colors.primaire, fontSize: 13, fontWeight: "600" },
  actions: { flexDirection: "row", gap: espacement.sm, marginTop: espacement.md },
  boutonEcouter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingHorizontal: espacement.lg,
    paddingVertical: 10,
  },
  boutonEcouterTexte: { color: colors.fond, fontWeight: "800" },
  boutonSecondaire: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.carte,
    borderRadius: rayon.rond,
    paddingHorizontal: espacement.lg,
    paddingVertical: 10,
  },
  boutonSecondaireTexte: { color: colors.primaire, fontWeight: "700" },
  blocLecture: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.md,
    marginTop: espacement.md,
  },
  etiquette: {
    color: colors.texteSecondaire,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  reference: { color: colors.primaire, fontSize: 13, fontWeight: "700", marginTop: 4 },
  texteLecture: { color: colors.texte, fontSize: 14, lineHeight: 22, marginTop: espacement.sm },
  blocEvangile: {
    backgroundColor: colors.fondClair,
    borderRadius: rayon.lg,
    padding: espacement.md,
    marginTop: espacement.md,
    borderWidth: 1,
    borderColor: colors.primaireSombre,
  },
  etiquetteEvangile: {
    color: colors.primaire,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  texteEvangile: {
    color: colors.texte,
    fontSize: 16,
    lineHeight: 26,
    marginTop: espacement.sm,
    fontStyle: "italic",
  },
  blocMeditation: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.md,
    marginTop: espacement.md,
  },
  titreMeditation: { color: colors.texte, fontSize: 15, fontWeight: "700" },
  texteMeditation: {
    color: colors.texteSecondaire,
    fontSize: 14,
    lineHeight: 22,
    marginTop: espacement.sm,
  },
});
