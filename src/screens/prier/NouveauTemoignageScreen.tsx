import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, espacement, rayon } from "@/theme/colors";
import type { TypeTemoignage } from "@/types";

const TYPES: TypeTemoignage[] = ["texte", "audio", "video"];

export function NouveauTemoignageScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [type, setType] = useState<TypeTemoignage>("texte");
  const [contenu, setContenu] = useState("");
  const [consentement, setConsentement] = useState(false);

  function envoyer() {
    if (!contenu.trim() || !consentement) return;
    Alert.alert(t("temoignages.partagerTemoignage"), t("temoignages.enAttenteValidation"));
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.conteneur} contentContainerStyle={{ padding: espacement.md, paddingBottom: 140 }}>
      <Text style={styles.titre}>{t("temoignages.partagerTemoignage")}</Text>

      <View style={styles.puces}>
        {TYPES.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.puce, type === option && styles.puceActive]}
            onPress={() => setType(option)}
          >
            <Text style={[styles.puceTexte, type === option && styles.puceTexteActif]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.zoneTexte}
        multiline
        placeholder="Racontez ce que Dieu a fait dans votre vie…"
        placeholderTextColor={colors.texteSecondaire}
        value={contenu}
        onChangeText={setContenu}
      />

      <View style={styles.ligneConsentement}>
        <Switch value={consentement} onValueChange={setConsentement} trackColor={{ true: colors.primaire }} />
        <Text style={styles.consentementTexte}>{t("temoignages.consentement")}</Text>
      </View>

      <TouchableOpacity
        style={[styles.boutonEnvoyer, (!contenu.trim() || !consentement) && styles.boutonDesactive]}
        onPress={envoyer}
        disabled={!contenu.trim() || !consentement}
      >
        <Text style={styles.boutonEnvoyerTexte}>{t("commun.envoyer")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  titre: { color: colors.texte, fontSize: 20, fontWeight: "800", marginBottom: espacement.md },
  puces: { flexDirection: "row", gap: 8, marginBottom: espacement.md },
  puce: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: rayon.rond, backgroundColor: colors.carte },
  puceActive: { backgroundColor: colors.primaire },
  puceTexte: { color: colors.texteSecondaire, fontSize: 12, textTransform: "capitalize" },
  puceTexteActif: { color: colors.fond, fontWeight: "700" },
  zoneTexte: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.md,
    color: colors.texte,
    minHeight: 140,
    textAlignVertical: "top",
  },
  ligneConsentement: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: espacement.lg },
  consentementTexte: { flex: 1, color: colors.texteSecondaire, fontSize: 12 },
  boutonEnvoyer: {
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: espacement.xl,
  },
  boutonDesactive: { opacity: 0.5 },
  boutonEnvoyerTexte: { color: colors.fond, fontWeight: "700", fontSize: 15 },
});
