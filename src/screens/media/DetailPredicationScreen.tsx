import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFavoris } from "@/context/FavorisContext";
import { usePlayer } from "@/context/PlayerContext";
import { predications } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";

export function DetailPredicationScreen() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const predication = predications.find((p) => p.id === route.params.id) ?? predications[0];
  const { pisteActuelle, enLecture, lirePiste, mettreEnPause, reprendre } = usePlayer();
  const { estFavori, basculerFavori } = useFavoris();
  const [note, setNote] = useState("");
  const [notesEnregistrees, setNotesEnregistrees] = useState<string[]>([]);
  const marquePage = estFavori("predication", predication.id);

  const estActif = pisteActuelle?.id === predication.id;

  function basculerLecture() {
    if (estActif) {
      enLecture ? mettreEnPause() : reprendre();
    } else {
      lirePiste({
        type: "predication",
        id: predication.id,
        titre: predication.titre,
        sousTitre: predication.predicateur,
        imageUrl: predication.imageUrl,
        audioUrl: predication.audioUrl,
      });
    }
  }

  function ajouterNote() {
    if (!note.trim()) return;
    setNotesEnregistrees((precedent) => [note.trim(), ...precedent]);
    setNote("");
  }

  return (
    <ScrollView style={styles.conteneur} contentContainerStyle={{ padding: espacement.md, paddingBottom: 160 }}>
      <Image source={{ uri: predication.imageUrl }} style={styles.image} />
      <Text style={styles.titre}>{predication.titre}</Text>
      <Text style={styles.sousTitre}>
        {t("predications.predicateur")}: {predication.predicateur}
      </Text>
      <Text style={styles.sousTitre}>
        {t("predications.serie")}: {predication.serie}
      </Text>
      {predication.verset ? <Text style={styles.verset}>{predication.verset}</Text> : null}

      <View style={styles.ligneBoutons}>
        <TouchableOpacity style={styles.boutonLecture} onPress={basculerLecture}>
          <Ionicons name={estActif && enLecture ? "pause" : "play"} size={20} color={colors.fond} />
          <Text style={styles.boutonLectureTexte}>
            {estActif && enLecture ? t("lecteur.pause") : t("lecteur.lecture")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.boutonMarque}
          onPress={() => basculerFavori("predication", predication.id)}
        >
          <Ionicons
            name={marquePage ? "bookmark" : "bookmark-outline"}
            size={22}
            color={colors.primaire}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitre}>{t("predications.notesPersonnelles")}</Text>
      <View style={styles.ligneNote}>
        <TextInput
          style={styles.inputNote}
          placeholder={t("predications.ajouterNote") as string}
          placeholderTextColor={colors.texteSecondaire}
          value={note}
          onChangeText={setNote}
        />
        <TouchableOpacity style={styles.boutonAjouterNote} onPress={ajouterNote}>
          <Ionicons name="add" size={20} color={colors.fond} />
        </TouchableOpacity>
      </View>
      {notesEnregistrees.map((n, index) => (
        <View key={index} style={styles.noteEnregistree}>
          <Text style={styles.noteTexte}>{n}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  image: { width: "100%", height: 220, borderRadius: rayon.lg, backgroundColor: colors.carte },
  titre: { color: colors.texte, fontSize: 20, fontWeight: "700", marginTop: espacement.md },
  sousTitre: { color: colors.texteSecondaire, fontSize: 13, marginTop: 4 },
  verset: { color: colors.primaire, fontSize: 13, marginTop: 6, fontStyle: "italic" },
  ligneBoutons: { flexDirection: "row", alignItems: "center", gap: espacement.sm, marginTop: espacement.lg },
  boutonLecture: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingVertical: 12,
  },
  boutonLectureTexte: { color: colors.fond, fontWeight: "700" },
  boutonMarque: {
    width: 46,
    height: 46,
    borderRadius: rayon.rond,
    backgroundColor: colors.carte,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitre: { color: colors.texte, fontSize: 15, fontWeight: "700", marginTop: espacement.lg, marginBottom: espacement.sm },
  ligneNote: { flexDirection: "row", gap: 8 },
  inputNote: {
    flex: 1,
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.texte,
  },
  boutonAjouterNote: {
    width: 44,
    height: 44,
    borderRadius: rayon.md,
    backgroundColor: colors.primaire,
    alignItems: "center",
    justifyContent: "center",
  },
  noteEnregistree: {
    backgroundColor: colors.carte,
    borderRadius: rayon.sm,
    padding: espacement.sm,
    marginTop: espacement.sm,
  },
  noteTexte: { color: colors.texte, fontSize: 13 },
});
