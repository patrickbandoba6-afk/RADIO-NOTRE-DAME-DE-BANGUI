import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { colors, espacement, rayon } from "@/theme/colors";

export function ConnexionScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { connecterAvecEmail, inscrireAvecEmail, continuerEnInvite } = useAuth();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [modeInscription, setModeInscription] = useState(false);
  const [enCours, setEnCours] = useState(false);

  async function valider() {
    setEnCours(true);
    const erreur = modeInscription
      ? await inscrireAvecEmail(email, motDePasse)
      : await connecterAvecEmail(email, motDePasse);
    setEnCours(false);
    if (erreur) {
      Alert.alert(t("commun.erreur"), erreur);
    } else {
      navigation.goBack();
    }
  }

  return (
    <View style={styles.conteneur}>
      <Text style={styles.titre}>
        {modeInscription ? t("compte.inscription") : t("compte.connexion")}
      </Text>

      <TextInput
        style={styles.input}
        placeholder={t("compte.email") as string}
        placeholderTextColor={colors.texteSecondaire}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder={t("compte.motDePasse") as string}
        placeholderTextColor={colors.texteSecondaire}
        secureTextEntry
        value={motDePasse}
        onChangeText={setMotDePasse}
      />

      <TouchableOpacity style={styles.boutonPrincipal} onPress={valider} disabled={enCours}>
        <Text style={styles.boutonPrincipalTexte}>
          {modeInscription ? t("compte.inscription") : t("compte.connexion")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setModeInscription(!modeInscription)}>
        <Text style={styles.lienSecondaire}>
          {modeInscription ? t("compte.connexion") : t("compte.inscription")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.boutonInvite}
        onPress={() => {
          continuerEnInvite();
          navigation.goBack();
        }}
      >
        <Text style={styles.boutonInviteTexte}>{t("compte.continuerInvite")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond, padding: espacement.md, justifyContent: "center" },
  titre: { color: colors.texte, fontSize: 22, fontWeight: "800", marginBottom: espacement.lg, textAlign: "center" },
  input: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    paddingHorizontal: espacement.md,
    paddingVertical: 12,
    color: colors.texte,
    marginBottom: espacement.sm,
  },
  boutonPrincipal: {
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: espacement.md,
  },
  boutonPrincipalTexte: { color: colors.fond, fontWeight: "700" },
  lienSecondaire: { color: colors.primaire, textAlign: "center", marginTop: espacement.md, fontSize: 13 },
  boutonInvite: { marginTop: espacement.xl, alignItems: "center" },
  boutonInviteTexte: { color: colors.texteSecondaire, fontSize: 13, textDecorationLine: "underline" },
});
