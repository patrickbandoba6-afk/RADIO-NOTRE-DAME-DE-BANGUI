import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { config } from "@/lib/config";
import { colors, espacement } from "@/theme/colors";

const DUREE_MS = 6000;

/** Écran de lancement : logo, signature, nom de la station, pendant 6 secondes. */
export function IntroScreen() {
  const navigation = useNavigation<any>();
  const { utilisateur, enChargement } = useAuth();
  const [dureeEcoulee, setDureeEcoulee] = useState(false);

  useEffect(() => {
    const identifiant = setTimeout(() => setDureeEcoulee(true), DUREE_MS);
    return () => clearTimeout(identifiant);
  }, []);

  useEffect(() => {
    if (!dureeEcoulee || enChargement) return;
    if (utilisateur && !utilisateur.estInvite) {
      navigation.replace("App");
    } else {
      navigation.replace("Choix");
    }
  }, [dureeEcoulee, enChargement, utilisateur, navigation]);

  return (
    <View style={styles.conteneur}>
      <Image
        source={require("../../../assets/logo-rndb.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.signature}>« {config.slogan} »</Text>
      <Text style={styles.nom}>{config.nomOfficiel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: colors.fond,
    alignItems: "center",
    justifyContent: "center",
    padding: espacement.xl,
  },
  logo: { width: 140, height: 140, marginBottom: espacement.lg },
  signature: {
    color: colors.primaire,
    fontSize: 15,
    fontStyle: "italic",
    marginBottom: espacement.sm,
    textAlign: "center",
  },
  nom: {
    color: colors.texte,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
