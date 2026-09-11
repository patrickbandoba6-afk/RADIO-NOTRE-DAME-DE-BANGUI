import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { alerter } from "@/lib/alerte";
import { colors, espacement, rayon } from "@/theme/colors";

export function InscriptionScreen() {
  const navigation = useNavigation<any>();
  const { inscrireAvecEmail } = useAuth();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [enCours, setEnCours] = useState(false);

  async function valider() {
    if (!nom.trim() || !email.trim() || motDePasse.length < 6) {
      alerter(
        "Champs incomplets",
        "Renseignez votre nom, votre e-mail et un mot de passe d'au moins 6 caractères."
      );
      return;
    }
    setEnCours(true);
    const { erreur, confirmationRequise } = await inscrireAvecEmail(
      email.trim(),
      motDePasse,
      nom.trim()
    );
    setEnCours(false);
    if (erreur) {
      alerter("Inscription impossible", erreur);
      return;
    }
    if (confirmationRequise) {
      alerter(
        "Confirmez votre e-mail",
        "Un e-mail de confirmation vous a été envoyé. Cliquez sur le lien qu'il contient, puis connectez-vous.",
        [{ text: "OK", onPress: () => navigation.replace("Connexion", { depuisLancement: true }) }]
      );
      return;
    }
    navigation.replace("App");
  }

  return (
    <View style={styles.conteneur}>
      <Text style={styles.titre}>Créer un compte</Text>
      <Text style={styles.sousTitre}>
        Retrouvez vos favoris, votre historique et vos téléchargements sur tous vos appareils.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nom"
        placeholderTextColor={colors.texteSecondaire}
        value={nom}
        onChangeText={setNom}
      />
      <TextInput
        style={styles.input}
        placeholder="Adresse e-mail"
        placeholderTextColor={colors.texteSecondaire}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor={colors.texteSecondaire}
        secureTextEntry
        value={motDePasse}
        onChangeText={setMotDePasse}
      />

      <TouchableOpacity style={styles.boutonPrincipal} onPress={valider} disabled={enCours}>
        <Text style={styles.boutonPrincipalTexte}>{enCours ? "Inscription…" : "S'inscrire"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.lienRetour}>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond, padding: espacement.xl, justifyContent: "center" },
  titre: { color: colors.texte, fontSize: 22, fontWeight: "800", textAlign: "center" },
  sousTitre: {
    color: colors.texteSecondaire,
    fontSize: 13,
    textAlign: "center",
    marginTop: espacement.sm,
    marginBottom: espacement.xl,
  },
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
  lienRetour: {
    color: colors.texteSecondaire,
    textAlign: "center",
    marginTop: espacement.xl,
    fontSize: 13,
  },
});
