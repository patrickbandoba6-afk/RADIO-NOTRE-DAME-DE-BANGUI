import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { EtatChargement, EtatVide } from "@/components/EtatsEcran";
import { FiltresPuces, type OptionFiltre } from "@/components/FiltresPuces";
import { useContenu } from "@/hooks/useContenu";
import { formaterHeure } from "@/lib/format";
import { chargerEvenements } from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { Evenement } from "@/types";

const PERIODES: OptionFiltre[] = [
  { cle: "tout", libelle: "Tout" },
  { cle: "aujourdhui", libelle: "Aujourd'hui" },
  { cle: "demain", libelle: "Demain" },
  { cle: "semaine", libelle: "Cette semaine" },
  { cle: "weekend", libelle: "Ce week-end" },
  { cle: "mois", libelle: "Ce mois" },
];

function memeJour(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function correspondPeriode(dateISO: string, periode: string): boolean {
  const date = new Date(dateISO);
  const maintenant = new Date();

  switch (periode) {
    case "aujourdhui":
      return memeJour(date, maintenant);
    case "demain": {
      const demain = new Date(maintenant);
      demain.setDate(demain.getDate() + 1);
      return memeJour(date, demain);
    }
    case "semaine": {
      const dans7Jours = new Date(maintenant);
      dans7Jours.setDate(dans7Jours.getDate() + 7);
      return date >= maintenant && date <= dans7Jours;
    }
    case "weekend": {
      const jour = date.getDay();
      const dans7Jours = new Date(maintenant);
      dans7Jours.setDate(dans7Jours.getDate() + 7);
      return (jour === 0 || jour === 6) && date >= maintenant && date <= dans7Jours;
    }
    case "mois":
      return (
        date.getMonth() === maintenant.getMonth() &&
        date.getFullYear() === maintenant.getFullYear()
      );
    default:
      return true;
  }
}

export function AgendaScreen() {
  const navigation = useNavigation<any>();
  const [periode, setPeriode] = useState("tout");
  const { donnees, chargement } = useContenu<Evenement[]>(chargerEvenements, []);

  const evenements = useMemo(
    () =>
      donnees
        .filter((evenement) => correspondPeriode(evenement.dateDebutISO, periode))
        .sort(
          (a, b) =>
            new Date(a.dateDebutISO).getTime() - new Date(b.dateDebutISO).getTime()
        ),
    [donnees, periode]
  );

  return (
    <EcranConteneur defilable={false}>
      <View style={styles.entete}>
        <View style={{ flex: 1 }}>
          <Text style={styles.titrePage}>Agenda</Text>
          <Text style={styles.sousTitrePage}>Messes, prières, conférences et rencontres</Text>
        </View>
        <TouchableOpacity
          style={styles.boutonAnnonces}
          onPress={() => navigation.navigate("Annonces")}
        >
          <Ionicons name="megaphone-outline" size={18} color={colors.primaire} />
        </TouchableOpacity>
      </View>

      <FiltresPuces options={PERIODES} actif={periode} onChanger={setPeriode} />

      {chargement ? (
        <EtatChargement />
      ) : evenements.length === 0 ? (
        <EtatVide
          icone="calendar-outline"
          titre="Aucun événement"
          description="Aucun événement prévu sur cette période."
        />
      ) : (
        <FlatList
          data={evenements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.liste}
          renderItem={({ item }) => {
            const date = new Date(item.dateDebutISO);
            return (
              <TouchableOpacity
                style={styles.carte}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("DetailEvenement", { id: item.id })}
              >
                <View style={styles.blocDate}>
                  <Text style={styles.jour}>{date.getDate()}</Text>
                  <Text style={styles.mois}>
                    {date.toLocaleDateString("fr-FR", { month: "short" })}
                  </Text>
                </View>
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                <View style={styles.textes}>
                  <Text style={styles.titre} numberOfLines={2}>
                    {item.titre}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {formaterHeure(item.dateDebutISO)}
                    {item.lieu ? ` · ${item.lieu}` : ""}
                  </Text>
                  <View
                    style={[
                      styles.modePuce,
                      item.mode === "en_ligne" ? styles.modeEnLigne : styles.modeSurPlace,
                    ]}
                  >
                    <Text style={styles.modeTexte}>
                      {item.mode === "en_ligne" ? "En ligne" : "Sur place"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </EcranConteneur>
  );
}

const styles = StyleSheet.create({
  entete: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: espacement.md,
    paddingTop: espacement.sm,
  },
  titrePage: { color: colors.texte, fontSize: 24, fontWeight: "800" },
  sousTitrePage: { color: colors.texteSecondaire, fontSize: 13, marginTop: 2 },
  boutonAnnonces: {
    width: 40,
    height: 40,
    borderRadius: rayon.rond,
    backgroundColor: colors.carte,
    alignItems: "center",
    justifyContent: "center",
  },
  liste: { padding: espacement.md, paddingBottom: 150 },
  carte: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.sm,
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.sm,
    marginBottom: espacement.sm,
  },
  blocDate: {
    width: 46,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: rayon.sm,
    backgroundColor: colors.fondClair,
  },
  jour: { color: colors.primaire, fontSize: 18, fontWeight: "800" },
  mois: { color: colors.texteSecondaire, fontSize: 10, textTransform: "uppercase" },
  image: { width: 54, height: 54, borderRadius: rayon.sm, backgroundColor: colors.fondClair },
  textes: { flex: 1 },
  titre: { color: colors.texte, fontSize: 14, fontWeight: "700", lineHeight: 19 },
  meta: { color: colors.texteSecondaire, fontSize: 11, marginTop: 3 },
  modePuce: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: rayon.rond,
    marginTop: 5,
  },
  modeEnLigne: { backgroundColor: colors.accent },
  modeSurPlace: { backgroundColor: colors.primaireSombre },
  modeTexte: { color: colors.blanc, fontSize: 9, fontWeight: "700" },
});
