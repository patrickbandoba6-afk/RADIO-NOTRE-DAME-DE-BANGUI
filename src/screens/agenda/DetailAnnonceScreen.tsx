import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Calendar from "expo-calendar";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EtatChargement, EtatVide } from "@/components/EtatsEcran";
import { useFavoris } from "@/context/FavorisContext";
import { useContenu } from "@/hooks/useContenu";
import { alerter } from "@/lib/alerte";
import {
  appeler,
  envoyerEmail,
  formaterDate,
  formaterHeure,
  ouvrirItineraire,
  ouvrirLien,
  partagerContenu,
} from "@/lib/format";
import { chargerAnnonces } from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { Annonce } from "@/types/editorial";

export function DetailAnnonceScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const id: string = route.params.id;
  const { estFavori, basculerFavori } = useFavoris();
  const [participe, setParticipe] = useState(false);

  const { donnees, chargement } = useContenu<Annonce[]>(chargerAnnonces, []);
  const annonce = donnees.find((a) => a.id === id);

  if (chargement) return <EtatChargement />;
  if (!annonce) return <EtatVide icone="megaphone-outline" titre="Annonce introuvable" />;

  const favori = estFavori("annonce", annonce.id);

  async function ajouterAuCalendrier() {
    if (!annonce) return;
    try {
      const { status } = await Calendar.requestCalendarPermissions();
      if (status !== "granted") return;
      const calendriers = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
      const calendrier = calendriers.find((c) => c.allowsModifications) ?? calendriers[0];
      if (!calendrier) return;
      const debut = new Date(annonce.dateDebutISO);
      const fin = annonce.dateFinISO
        ? new Date(annonce.dateFinISO)
        : new Date(debut.getTime() + 2 * 3600 * 1000);
      await calendrier.createEvent({
        title: annonce.titre,
        startDate: debut,
        endDate: fin,
        location: annonce.adresse ?? annonce.lieu,
        timeZone: "Africa/Bangui",
      });
      alerter(annonce.titre, "Ajouté à votre calendrier.");
    } catch {
      // Le calendrier n'est pas disponible sur cette plateforme.
    }
  }

  return (
    <ScrollView style={styles.conteneur} contentContainerStyle={{ paddingBottom: 150 }}>
      {annonce.imageUrl ? (
        <View>
          <Image source={{ uri: annonce.imageUrl }} style={styles.image} />
          <TouchableOpacity style={styles.boutonRetour} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.texte} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.contenu}>
        {annonce.urgente ? <Text style={styles.urgente}>● INFORMATION URGENTE</Text> : null}
        <Text style={styles.titre}>{annonce.titre}</Text>
        <Text style={styles.organisateur}>{annonce.organisateur}</Text>

        <View style={styles.blocInfos}>
          <LigneInfo
            icone="calendar-outline"
            valeur={`${formaterDate(annonce.dateDebutISO)} à ${formaterHeure(annonce.dateDebutISO)}`}
          />
          {annonce.dateFinISO ? (
            <LigneInfo icone="time-outline" valeur={`Jusqu'au ${formaterDate(annonce.dateFinISO)}`} />
          ) : null}
          {annonce.lieu ? <LigneInfo icone="location-outline" valeur={annonce.lieu} /> : null}
          {annonce.adresse ? <LigneInfo icone="map-outline" valeur={annonce.adresse} /> : null}
          {annonce.prix ? <LigneInfo icone="pricetag-outline" valeur={annonce.prix} /> : null}
        </View>

        <Text style={styles.description}>{annonce.description}</Text>

        <TouchableOpacity
          style={[styles.boutonParticipe, participe && styles.boutonParticipeActif]}
          onPress={() => setParticipe(!participe)}
        >
          <Ionicons
            name={participe ? "checkmark-circle" : "hand-right-outline"}
            size={20}
            color={colors.fond}
          />
          <Text style={styles.boutonParticipeTexte}>
            {participe ? "Vous participez" : "Je participe"}
          </Text>
        </TouchableOpacity>

        <View style={styles.grilleActions}>
          <ActionRonde icone="calendar" libelle="Calendrier" onPress={ajouterAuCalendrier} />
          <ActionRonde
            icone={favori ? "heart" : "heart-outline"}
            libelle="Favori"
            onPress={() => basculerFavori("annonce", annonce.id)}
          />
          <ActionRonde
            icone="share-social-outline"
            libelle="Partager"
            onPress={() => partagerContenu(annonce.titre, annonce.description)}
          />
          {annonce.telephone ? (
            <ActionRonde
              icone="call-outline"
              libelle="Appeler"
              onPress={() => appeler(annonce.telephone!)}
            />
          ) : null}
          {annonce.email ? (
            <ActionRonde
              icone="mail-outline"
              libelle="Email"
              onPress={() => envoyerEmail(annonce.email!, annonce.titre)}
            />
          ) : null}
          {annonce.adresse ? (
            <ActionRonde
              icone="navigate-outline"
              libelle="Itinéraire"
              onPress={() =>
                ouvrirItineraire(annonce.adresse!, annonce.latitude, annonce.longitude)
              }
            />
          ) : null}
        </View>

        {annonce.lienInscription ? (
          <TouchableOpacity
            style={styles.boutonInscription}
            onPress={() => ouvrirLien(annonce.lienInscription!)}
          >
            <Text style={styles.boutonInscriptionTexte}>S'inscrire en ligne</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}

function LigneInfo({
  icone,
  valeur,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  valeur: string;
}) {
  return (
    <View style={styles.ligneInfo}>
      <Ionicons name={icone} size={16} color={colors.primaire} />
      <Text style={styles.ligneInfoTexte}>{valeur}</Text>
    </View>
  );
}

function ActionRonde({
  icone,
  libelle,
  onPress,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  libelle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.action} onPress={onPress}>
      <View style={styles.actionRond}>
        <Ionicons name={icone} size={19} color={colors.primaire} />
      </View>
      <Text style={styles.actionTexte}>{libelle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  image: { width: "100%", height: 220, backgroundColor: colors.carte },
  boutonRetour: {
    position: "absolute",
    top: 48,
    left: espacement.md,
    width: 38,
    height: 38,
    borderRadius: rayon.rond,
    backgroundColor: "rgba(11,31,58,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  contenu: { padding: espacement.md },
  urgente: { color: colors.danger, fontSize: 11, fontWeight: "800", marginBottom: 6 },
  titre: { color: colors.texte, fontSize: 22, fontWeight: "800", lineHeight: 29 },
  organisateur: { color: colors.texteSecondaire, fontSize: 13, marginTop: 4 },
  blocInfos: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.md,
    marginTop: espacement.md,
    gap: espacement.sm,
  },
  ligneInfo: { flexDirection: "row", alignItems: "center", gap: espacement.sm },
  ligneInfoTexte: { color: colors.texte, fontSize: 13, flex: 1 },
  description: { color: colors.texte, fontSize: 15, lineHeight: 23, marginTop: espacement.md },
  boutonParticipe: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingVertical: 14,
    marginTop: espacement.lg,
  },
  boutonParticipeActif: { backgroundColor: colors.succes },
  boutonParticipeTexte: { color: colors.fond, fontWeight: "800", fontSize: 15 },
  grilleActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: espacement.md,
    marginTop: espacement.lg,
  },
  action: { alignItems: "center", gap: 5, width: 64 },
  actionRond: {
    width: 46,
    height: 46,
    borderRadius: rayon.rond,
    backgroundColor: colors.carte,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTexte: { color: colors.texteSecondaire, fontSize: 10 },
  boutonInscription: {
    borderWidth: 1,
    borderColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: espacement.lg,
  },
  boutonInscriptionTexte: { color: colors.primaire, fontWeight: "700" },
});
