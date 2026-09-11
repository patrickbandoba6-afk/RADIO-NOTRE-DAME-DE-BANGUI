import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { EtatChargement } from "@/components/EtatsEcran";
import { useContenu } from "@/hooks/useContenu";
import { appeler, ouvrirItineraire } from "@/lib/format";
import { chargerDioceses, chargerParoisses } from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { DioceseFiche, Paroisse } from "@/types/editorial";

export function ParoissesScreen() {
  const { donnees: paroisses, chargement: chargementParoisses } = useContenu<Paroisse[]>(
    chargerParoisses,
    []
  );
  const { donnees: dioceses, chargement: chargementDioceses } = useContenu<DioceseFiche[]>(
    chargerDioceses,
    []
  );

  if (chargementParoisses || chargementDioceses) return <EtatChargement />;

  return (
    <EcranConteneur defilable={false}>
      <ScrollView contentContainerStyle={{ padding: espacement.md, paddingBottom: 150 }}>
        <Text style={styles.titrePage}>Paroisses & diocèses</Text>

        <Text style={styles.titreSection}>Diocèses</Text>
        {dioceses.map((diocese) => (
          <View key={diocese.id} style={styles.carteDiocese}>
            <Text style={styles.nom}>{diocese.nom}</Text>
            {diocese.eveque ? (
              <Text style={styles.detail}>Évêque : {diocese.eveque}</Text>
            ) : null}
            {diocese.territoire ? (
              <Text style={styles.detail}>{diocese.territoire}</Text>
            ) : null}
          </View>
        ))}

        <Text style={styles.titreSection}>Paroisses</Text>
        {paroisses.map((paroisse) => (
          <View key={paroisse.id} style={styles.carteParoisse}>
            <View style={styles.enteteParoisse}>
              {paroisse.imageUrl ? (
                <Image source={{ uri: paroisse.imageUrl }} style={styles.image} />
              ) : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.nom} numberOfLines={2}>
                  {paroisse.nom}
                </Text>
                <Text style={styles.detail} numberOfLines={2}>
                  {paroisse.adresse}
                  {paroisse.quartier ? ` · ${paroisse.quartier}` : ""}
                </Text>
              </View>
            </View>

            {paroisse.horairesMesses.length > 0 ? (
              <View style={styles.horaires}>
                {paroisse.horairesMesses.map((horaire) => (
                  <View key={horaire.jour} style={styles.ligneHoraire}>
                    <Text style={styles.jour}>{horaire.jour}</Text>
                    <Text style={styles.heures}>{horaire.heures.join(" · ")}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.actions}>
              {paroisse.telephone ? (
                <TouchableOpacity
                  style={styles.bouton}
                  onPress={() => appeler(paroisse.telephone!)}
                >
                  <Ionicons name="call-outline" size={15} color={colors.primaire} />
                  <Text style={styles.boutonTexte}>Appeler</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                style={styles.bouton}
                onPress={() =>
                  ouvrirItineraire(
                    `${paroisse.nom} ${paroisse.adresse} ${paroisse.ville}`,
                    paroisse.latitude,
                    paroisse.longitude
                  )
                }
              >
                <Ionicons name="navigate-outline" size={15} color={colors.primaire} />
                <Text style={styles.boutonTexte}>Itinéraire</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </EcranConteneur>
  );
}

const styles = StyleSheet.create({
  titrePage: { color: colors.texte, fontSize: 24, fontWeight: "800" },
  titreSection: {
    color: colors.texteSecondaire,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginTop: espacement.lg,
    marginBottom: espacement.sm,
  },
  carteDiocese: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.md,
    marginBottom: espacement.sm,
  },
  carteParoisse: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.md,
    marginBottom: espacement.md,
  },
  enteteParoisse: { flexDirection: "row", gap: espacement.sm, alignItems: "center" },
  image: { width: 58, height: 58, borderRadius: rayon.sm, backgroundColor: colors.fondClair },
  nom: { color: colors.texte, fontSize: 15, fontWeight: "700", lineHeight: 20 },
  detail: { color: colors.texteSecondaire, fontSize: 12, marginTop: 3 },
  horaires: {
    marginTop: espacement.sm,
    paddingTop: espacement.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separateur,
    gap: 4,
  },
  ligneHoraire: { flexDirection: "row", justifyContent: "space-between" },
  jour: { color: colors.texteSecondaire, fontSize: 12 },
  heures: { color: colors.primaire, fontSize: 12, fontWeight: "600" },
  actions: { flexDirection: "row", gap: espacement.lg, marginTop: espacement.sm },
  bouton: { flexDirection: "row", alignItems: "center", gap: 5 },
  boutonTexte: { color: colors.primaire, fontSize: 12, fontWeight: "600" },
});
