import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { EtatChargement, EtatVide } from "@/components/EtatsEcran";
import { FiltresPuces } from "@/components/FiltresPuces";
import { usePlayer } from "@/context/PlayerContext";
import { useContenu } from "@/hooks/useContenu";
import { minutesDepuisMinuit } from "@/lib/format";
import { chargerGrille } from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { CreneauProgramme } from "@/types/editorial";

const JOURS = [
  { cle: "-1", libelle: "Hier" },
  { cle: "0", libelle: "Aujourd'hui" },
  { cle: "1", libelle: "Demain" },
];

export function GrilleScreen() {
  const navigation = useNavigation<any>();
  const { lireDirect } = usePlayer();
  const [decalage, setDecalage] = useState("0");

  const { donnees, chargement } = useContenu<CreneauProgramme[]>(chargerGrille, []);

  const dateAffichee = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + Number(decalage));
    return date;
  }, [decalage]);

  const creneaux = useMemo(() => {
    const jour = dateAffichee.getDay();
    return donnees
      .filter((creneau) => creneau.jourSemaine === jour)
      .sort((a, b) => minutesDepuisMinuit(a.heureDebut) - minutesDepuisMinuit(b.heureDebut));
  }, [donnees, dateAffichee]);

  const minutesActuelles = new Date().getHours() * 60 + new Date().getMinutes();

  function estEnDirect(creneau: CreneauProgramme) {
    if (decalage !== "0") return false;
    const debut = minutesDepuisMinuit(creneau.heureDebut);
    const fin = minutesDepuisMinuit(creneau.heureFin);
    return minutesActuelles >= debut && minutesActuelles < fin;
  }

  return (
    <EcranConteneur defilable={false}>
      <Text style={styles.titrePage}>Grille des programmes</Text>
      <Text style={styles.sousTitrePage}>
        {dateAffichee.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </Text>
      <FiltresPuces options={JOURS} actif={decalage} onChanger={setDecalage} />

      {chargement ? (
        <EtatChargement />
      ) : creneaux.length === 0 ? (
        <EtatVide
          icone="calendar-outline"
          titre="Aucun programme"
          description="La grille de ce jour n'est pas encore renseignée."
        />
      ) : (
        <FlatList
          data={creneaux}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.liste}
          renderItem={({ item }) => {
            const enDirect = estEnDirect(item);
            return (
              <View style={styles.ligne}>
                <View style={styles.colonneHeure}>
                  <View style={[styles.marqueur, enDirect && styles.marqueurDirect]} />
                  <Text style={[styles.heure, enDirect && styles.heureDirect]}>
                    {item.heureDebut}
                  </Text>
                  {enDirect ? (
                    <View style={styles.badgeDirect}>
                      <Text style={styles.badgeDirectTexte}>● EN DIRECT</Text>
                    </View>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={[styles.carte, enDirect && styles.carteDirect]}
                  activeOpacity={0.85}
                  onPress={() =>
                    enDirect
                      ? lireDirect()
                      : navigation.navigate("DetailEmission", { id: item.emissionId })
                  }
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.image} />
                  <View style={styles.textes}>
                    <Text style={styles.nomEmission} numberOfLines={2}>
                      {item.emissionNom}
                    </Text>
                    <Text style={styles.animateur} numberOfLines={1}>
                      par {item.animateur}
                    </Text>
                    <Text style={styles.plage}>
                      {item.heureDebut} – {item.heureFin}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
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
  },
  sousTitrePage: {
    color: colors.texteSecondaire,
    fontSize: 13,
    paddingHorizontal: espacement.md,
    marginTop: 2,
    textTransform: "capitalize",
  },
  liste: { padding: espacement.md, paddingBottom: 150 },
  ligne: { flexDirection: "row", gap: espacement.sm, marginBottom: espacement.md },
  colonneHeure: { width: 74, alignItems: "flex-start", paddingTop: 4 },
  marqueur: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: colors.texteSecondaire,
    marginBottom: 4,
  },
  marqueurDirect: { backgroundColor: colors.danger },
  heure: { color: colors.texteSecondaire, fontSize: 14, fontWeight: "700" },
  heureDirect: { color: colors.danger },
  badgeDirect: {
    backgroundColor: colors.danger,
    borderRadius: rayon.rond,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  badgeDirectTexte: { color: colors.blanc, fontSize: 8, fontWeight: "800" },
  carte: {
    flex: 1,
    flexDirection: "row",
    gap: espacement.sm,
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.sm,
    alignItems: "center",
  },
  carteDirect: { borderWidth: 1, borderColor: colors.danger },
  image: { width: 52, height: 52, borderRadius: rayon.sm, backgroundColor: colors.fondClair },
  textes: { flex: 1 },
  nomEmission: { color: colors.texte, fontSize: 14, fontWeight: "700", lineHeight: 19 },
  animateur: { color: colors.texteSecondaire, fontSize: 12, marginTop: 2 },
  plage: { color: colors.primaire, fontSize: 11, marginTop: 3 },
});
