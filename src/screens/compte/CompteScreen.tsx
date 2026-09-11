import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { colors, espacement, rayon } from "@/theme/colors";

export function CompteScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { utilisateur, seDeconnecter } = useAuth();

  if (!utilisateur) {
    return (
      <View style={styles.conteneurVide}>
        <Ionicons name="person-circle-outline" size={72} color={colors.texteSecondaire} />
        <Text style={styles.titreVide}>{t("compte.titre")}</Text>
        <TouchableOpacity
          style={styles.boutonPrincipal}
          onPress={() => navigation.navigate("Connexion")}
        >
          <Text style={styles.boutonPrincipalTexte}>{t("compte.connexion")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const items = [
    {
      cle: "favoris",
      icone: "heart-outline" as const,
      libelle: t("compte.mesFavoris"),
      action: () => navigation.navigate("Favoris"),
    },
    {
      cle: "telechargements",
      icone: "download-outline" as const,
      libelle: t("compte.mesTelechargements"),
      action: () => navigation.navigate("Telechargements"),
    },
    { cle: "dons", icone: "gift-outline" as const, libelle: t("dons.titre"), action: () => navigation.navigate("Dons") },
    { cle: "parametres", icone: "settings-outline" as const, libelle: t("parametres.titre"), action: () => navigation.navigate("Parametres") },
  ];

  return (
    <View style={styles.conteneur}>
      <View style={styles.entete}>
        <Ionicons name="person-circle" size={56} color={colors.primaire} />
        <View>
          <Text style={styles.nom}>{utilisateur.nom}</Text>
          {utilisateur.estInvite ? (
            <Text style={styles.badgeInvite}>{t("commun.modeInvite")}</Text>
          ) : null}
        </View>
      </View>

      {items.map((item) => (
        <TouchableOpacity key={item.cle} style={styles.ligne} onPress={item.action}>
          <Ionicons name={item.icone} size={20} color={colors.primaire} />
          <Text style={styles.ligneTexte}>{item.libelle}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.texteSecondaire} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.boutonDeconnexion} onPress={seDeconnecter}>
        <Text style={styles.boutonDeconnexionTexte}>{t("compte.deconnexion")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond, padding: espacement.md },
  conteneurVide: { flex: 1, backgroundColor: colors.fond, alignItems: "center", justifyContent: "center", gap: espacement.md },
  titreVide: { color: colors.texte, fontSize: 18, fontWeight: "700" },
  entete: { flexDirection: "row", alignItems: "center", gap: espacement.sm, marginBottom: espacement.lg },
  nom: { color: colors.texte, fontSize: 18, fontWeight: "700" },
  badgeInvite: { color: colors.attente, fontSize: 12, marginTop: 2 },
  ligne: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.sm,
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    paddingHorizontal: espacement.md,
    paddingVertical: 14,
    marginBottom: espacement.sm,
  },
  ligneTexte: { flex: 1, color: colors.texte, fontSize: 14 },
  boutonPrincipal: {
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingHorizontal: espacement.xl,
    paddingVertical: 12,
  },
  boutonPrincipalTexte: { color: colors.fond, fontWeight: "700" },
  boutonDeconnexion: { marginTop: espacement.lg, alignItems: "center" },
  boutonDeconnexionTexte: { color: colors.danger, fontSize: 14, fontWeight: "600" },
});
