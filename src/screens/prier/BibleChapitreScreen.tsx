import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { chargerVersetsChapitre } from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { VersetBible } from "@/types";

export function BibleChapitreScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { livreCode, livreNom, nombreChapitres } = route.params;
  const [chapitre, setChapitre] = useState<number>(route.params.chapitre ?? 1);
  const [versets, setVersets] = useState<VersetBible[] | null>(null);
  const [enLecture, setEnLecture] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: `${livreNom} ${chapitre}` });
  }, [livreNom, chapitre, navigation]);

  useEffect(() => {
    setVersets(null);
    Speech.stop();
    setEnLecture(false);
    chargerVersetsChapitre(livreCode, chapitre, "crampon1923").then(setVersets);
  }, [livreCode, chapitre]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  function basculerLecture() {
    if (enLecture) {
      Speech.stop();
      setEnLecture(false);
      return;
    }
    if (!versets || versets.length === 0) return;
    const texte = versets.map((v) => `${v.verset}. ${v.texte}`).join(" ");
    setEnLecture(true);
    Speech.speak(texte, {
      language: "fr-FR",
      onDone: () => setEnLecture(false),
      onStopped: () => setEnLecture(false),
      onError: () => setEnLecture(false),
    });
  }

  function changerChapitre(suivant: number) {
    if (suivant < 1 || (nombreChapitres && suivant > nombreChapitres)) return;
    setChapitre(suivant);
  }

  return (
    <View style={styles.conteneur}>
      <View style={styles.barreNavigation}>
        <TouchableOpacity
          style={styles.boutonChapitre}
          disabled={chapitre <= 1}
          onPress={() => changerChapitre(chapitre - 1)}
        >
          <Ionicons name="chevron-back" size={18} color={chapitre <= 1 ? colors.texteSecondaire : colors.primaire} />
        </TouchableOpacity>

        <Text style={styles.titreChapitre}>
          {livreNom} {chapitre}
          {nombreChapitres ? ` / ${nombreChapitres}` : ""}
        </Text>

        <TouchableOpacity
          style={styles.boutonChapitre}
          disabled={Boolean(nombreChapitres) && chapitre >= nombreChapitres}
          onPress={() => changerChapitre(chapitre + 1)}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color={nombreChapitres && chapitre >= nombreChapitres ? colors.texteSecondaire : colors.primaire}
          />
        </TouchableOpacity>
      </View>

      {versets === null ? (
        <ActivityIndicator color={colors.primaire} style={{ marginTop: espacement.xl }} />
      ) : versets.length === 0 ? (
        <View style={styles.videConteneur}>
          <Text style={styles.videTexte}>Ce chapitre n&apos;est pas encore disponible.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: espacement.md, paddingBottom: 160 }}>
          {versets.map((v) => (
            <Text key={v.verset} style={styles.paragrapheVerset}>
              <Text style={styles.numeroVerset}>{v.verset} </Text>
              {v.texte}
            </Text>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.boutonEcouter} onPress={basculerLecture} disabled={!versets || versets.length === 0}>
        <Ionicons name={enLecture ? "pause" : "volume-high"} size={20} color={colors.fond} />
        <Text style={styles.boutonEcouterTexte}>
          {enLecture ? "Arrêter la lecture" : "Écouter ce chapitre"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  barreNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: espacement.md,
    paddingVertical: espacement.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separateur,
  },
  boutonChapitre: {
    width: 36,
    height: 36,
    borderRadius: rayon.rond,
    backgroundColor: colors.carte,
    alignItems: "center",
    justifyContent: "center",
  },
  titreChapitre: { color: colors.texte, fontSize: 15, fontWeight: "700" },
  videConteneur: { flex: 1, alignItems: "center", justifyContent: "center", padding: espacement.xl },
  videTexte: { color: colors.texteSecondaire, fontSize: 14, textAlign: "center" },
  paragrapheVerset: { color: colors.texte, fontSize: 16, lineHeight: 26, marginBottom: 4 },
  numeroVerset: { color: colors.primaire, fontSize: 12, fontWeight: "700" },
  boutonEcouter: {
    position: "absolute",
    left: espacement.md,
    right: espacement.md,
    bottom: espacement.lg,
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  boutonEcouterTexte: { color: colors.fond, fontWeight: "700", fontSize: 14 },
});
