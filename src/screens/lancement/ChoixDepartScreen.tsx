import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { config } from "@/lib/config";
import { colors, espacement, rayon } from "@/theme/colors";

export function ChoixDepartScreen() {
  const navigation = useNavigation<any>();
  const { continuerEnInvite } = useAuth();

  return (
    <View style={styles.conteneur}>
      <Image
        source={require("../../../assets/logo-rndb.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.titre}>{config.nomOfficiel}</Text>
      <Text style={styles.sousTitre}>Comment souhaitez-vous continuer ?</Text>

      <TouchableOpacity
        style={styles.boutonPrincipal}
        onPress={() => navigation.navigate("Connexion", { depuisLancement: true })}
      >
        <Ionicons name="log-in-outline" size={20} color={colors.fond} />
        <Text style={styles.boutonPrincipalTexte}>Se connecter</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.lienConnexion}
        onPress={() => navigation.navigate("Inscription")}
      >
        <Text style={styles.lienConnexionTexte}>Nouveau ici ? S&apos;inscrire</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.boutonSecondaire}
        onPress={() =>
          navigation.navigate("App", { screen: "MenuStack", params: { screen: "Admin" } })
        }
      >
        <Ionicons name="shield-checkmark-outline" size={20} color={colors.texte} />
        <Text style={styles.boutonSecondaireTexte}>Mode administrateur</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.lienInvite}
        onPress={() => {
          continuerEnInvite();
          navigation.replace("App");
        }}
      >
        <Text style={styles.lienInviteTexte}>Continuer sans compte</Text>
      </TouchableOpacity>
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
  logo: { width: 96, height: 96, marginBottom: espacement.lg },
  titre: { color: colors.texte, fontSize: 20, fontWeight: "800", textAlign: "center" },
  sousTitre: {
    color: colors.texteSecondaire,
    fontSize: 14,
    marginTop: espacement.sm,
    marginBottom: espacement.xl,
    textAlign: "center",
  },
  boutonPrincipal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingVertical: 14,
    width: "100%",
  },
  boutonPrincipalTexte: { color: colors.fond, fontWeight: "700", fontSize: 15 },
  lienConnexion: { marginTop: espacement.md, marginBottom: espacement.sm },
  lienConnexionTexte: { color: colors.primaire, fontSize: 13, fontWeight: "600" },
  boutonSecondaire: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.carte,
    borderRadius: rayon.rond,
    paddingVertical: 14,
    width: "100%",
    marginTop: espacement.sm,
  },
  boutonSecondaireTexte: { color: colors.texte, fontWeight: "700", fontSize: 15 },
  lienInvite: { marginTop: espacement.xl },
  lienInviteTexte: { color: colors.texteSecondaire, fontSize: 13, textDecorationLine: "underline" },
});
