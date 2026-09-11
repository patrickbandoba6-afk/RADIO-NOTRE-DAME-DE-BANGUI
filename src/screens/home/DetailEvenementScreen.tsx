import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import * as Calendar from "expo-calendar";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { evenements } from "@/data/sampleData";
import { alerter } from "@/lib/alerte";
import { colors, espacement, rayon } from "@/theme/colors";

export function DetailEvenementScreen() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const evenement = evenements.find((e) => e.id === route.params.id) ?? evenements[0];
  const [inscrit, setInscrit] = useState(evenement.estInscrit);

  async function ajouterAuCalendrier() {
    try {
      const { status } = await Calendar.requestCalendarPermissions();
      if (status !== "granted") {
        alerter(t("erreur") as string);
        return;
      }
      const calendriers = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
      const calendrierParDefaut = calendriers.find((c) => c.allowsModifications) ?? calendriers[0];
      if (!calendrierParDefaut) return;
      await calendrierParDefaut.createEvent({
        title: evenement.titre,
        startDate: new Date(evenement.dateDebutISO),
        endDate: new Date(evenement.dateFinISO),
        timeZone: evenement.fuseauHoraire,
        location: evenement.lieu,
      });
      alerter(evenement.titre, t("evenements.ajouterCalendrier") as string);
    } catch {
      // L'ajout au calendrier n'est pas disponible sur cette plateforme.
    }
  }

  return (
    <ScrollView style={styles.conteneur} contentContainerStyle={{ paddingBottom: 140 }}>
      <Image source={{ uri: evenement.imageUrl }} style={styles.image} />
      <View style={styles.contenu}>
        <Text style={styles.titre}>{evenement.titre}</Text>
        <Text style={styles.date}>
          {new Date(evenement.dateDebutISO).toLocaleString("fr-FR", {
            dateStyle: "full",
            timeStyle: "short",
          })}
        </Text>
        {evenement.lieu ? <Text style={styles.lieu}>{evenement.lieu}</Text> : null}
        <Text style={styles.description}>{evenement.description}</Text>

        <View style={styles.ligneBoutons}>
          <TouchableOpacity
            style={[styles.boutonInscription, inscrit && styles.boutonInscritActif]}
            onPress={() => setInscrit(!inscrit)}
          >
            <Text style={styles.boutonInscriptionTexte}>
              {inscrit ? t("evenements.inscrit") : t("evenements.sInscrire")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.boutonCalendrier} onPress={ajouterAuCalendrier}>
            <Ionicons name="calendar-outline" size={20} color={colors.primaire} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitre}>{t("evenements.intervenants")}</Text>
        {evenement.intervenants.map((nom) => (
          <Text key={nom} style={styles.intervenant}>• {nom}</Text>
        ))}

        <Text style={styles.sectionTitre}>{t("evenements.programme")}</Text>
        {evenement.programme.map((etape) => (
          <View key={etape.heure} style={styles.etapeProgramme}>
            <Text style={styles.heureProgramme}>{etape.heure}</Text>
            <Text style={styles.titreProgramme}>{etape.titre}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  image: { width: "100%", height: 200, backgroundColor: colors.carte },
  contenu: { padding: espacement.md },
  titre: { color: colors.texte, fontSize: 20, fontWeight: "800" },
  date: { color: colors.primaire, fontSize: 13, marginTop: 8 },
  lieu: { color: colors.texteSecondaire, fontSize: 13, marginTop: 4 },
  description: { color: colors.texte, fontSize: 14, marginTop: espacement.md, lineHeight: 20 },
  ligneBoutons: { flexDirection: "row", gap: espacement.sm, marginTop: espacement.lg },
  boutonInscription: {
    flex: 1,
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingVertical: 12,
    alignItems: "center",
  },
  boutonInscritActif: { backgroundColor: colors.succes },
  boutonInscriptionTexte: { color: colors.fond, fontWeight: "700" },
  boutonCalendrier: {
    width: 46,
    height: 46,
    borderRadius: rayon.rond,
    backgroundColor: colors.carte,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitre: { color: colors.texte, fontSize: 15, fontWeight: "700", marginTop: espacement.lg, marginBottom: espacement.sm },
  intervenant: { color: colors.texteSecondaire, fontSize: 13, marginBottom: 4 },
  etapeProgramme: { flexDirection: "row", gap: espacement.sm, marginBottom: 6 },
  heureProgramme: { color: colors.primaire, fontSize: 13, fontWeight: "700", width: 50 },
  titreProgramme: { color: colors.texte, fontSize: 13 },
});
