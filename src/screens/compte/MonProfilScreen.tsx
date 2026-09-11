import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { alerter } from "@/lib/alerte";
import { supabase } from "@/lib/supabase";
import { colors, espacement, rayon } from "@/theme/colors";

export function MonProfilScreen() {
  const { utilisateur, mettreAJourProfil, seDeconnecter } = useAuth();
  const [nom, setNom] = useState(utilisateur?.nom ?? "");
  const [enregistrement, setEnregistrement] = useState(false);
  const [televersement, setTeleversement] = useState(false);

  if (!utilisateur || utilisateur.estInvite) {
    return (
      <View style={styles.conteneurVide}>
        <Text style={styles.texteVide}>Connectez-vous pour gérer votre profil.</Text>
      </View>
    );
  }

  async function changerPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alerter("Permission requise", "Autorisez l'accès à vos photos pour changer votre avatar.");
      return;
    }
    const resultat = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (resultat.canceled || !resultat.assets[0] || !supabase) return;

    setTeleversement(true);
    try {
      const asset = resultat.assets[0];
      const reponse = await fetch(asset.uri);
      const donnees = await reponse.arrayBuffer();
      const chemin = `${utilisateur!.id}/avatar.jpg`;

      const { error: erreurEnvoi } = await supabase.storage
        .from("avatars")
        .upload(chemin, donnees, { contentType: "image/jpeg", upsert: true });
      if (erreurEnvoi) throw erreurEnvoi;

      const { data } = supabase.storage.from("avatars").getPublicUrl(chemin);
      const urlAvecCache = `${data.publicUrl}?t=${Date.now()}`;
      const erreur = await mettreAJourProfil({ photoUrl: urlAvecCache });
      if (erreur) throw new Error(erreur);
    } catch (e) {
      alerter(
        "Échec de l'envoi",
        e instanceof Error ? e.message : "Vérifiez que le bucket 'avatars' est configuré (voir supabase/schema_avatars.sql)."
      );
    } finally {
      setTeleversement(false);
    }
  }

  async function enregistrerNom() {
    if (!nom.trim()) return;
    setEnregistrement(true);
    const erreur = await mettreAJourProfil({ nom: nom.trim() });
    setEnregistrement(false);
    if (erreur) alerter("Échec", erreur);
    else alerter("Enregistré", "Votre profil a été mis à jour.");
  }

  return (
    <View style={styles.conteneur}>
      <TouchableOpacity style={styles.zoneAvatar} onPress={changerPhoto} disabled={televersement}>
        {utilisateur.photoUrl ? (
          <Image source={{ uri: utilisateur.photoUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarVide}>
            <Ionicons name="person" size={40} color={colors.texteSecondaire} />
          </View>
        )}
        <View style={styles.badgeAppareil}>
          {televersement ? (
            <ActivityIndicator size="small" color={colors.fond} />
          ) : (
            <Ionicons name="camera" size={14} color={colors.fond} />
          )}
        </View>
      </TouchableOpacity>
      <Text style={styles.lienChangerPhoto} onPress={changerPhoto}>
        Changer la photo
      </Text>

      <View style={styles.champ}>
        <Text style={styles.libelle}>Nom</Text>
        <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Votre nom" placeholderTextColor={colors.texteSecondaire} />
      </View>

      <View style={styles.champ}>
        <Text style={styles.libelle}>E-mail</Text>
        <Text style={styles.emailValeur}>{utilisateur.email}</Text>
      </View>

      <TouchableOpacity style={styles.boutonPrincipal} onPress={enregistrerNom} disabled={enregistrement}>
        <Text style={styles.boutonPrincipalTexte}>
          {enregistrement ? "Enregistrement…" : "Enregistrer"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.boutonDeconnexion} onPress={seDeconnecter}>
        <Text style={styles.boutonDeconnexionTexte}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond, padding: espacement.md, alignItems: "center" },
  conteneurVide: { flex: 1, backgroundColor: colors.fond, alignItems: "center", justifyContent: "center", padding: espacement.xl },
  texteVide: { color: colors.texteSecondaire, fontSize: 14, textAlign: "center" },
  zoneAvatar: { marginTop: espacement.lg },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.carte },
  avatarVide: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.carte,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeAppareil: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaire,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.fond,
  },
  lienChangerPhoto: { color: colors.primaire, fontSize: 12, fontWeight: "600", marginTop: espacement.sm, marginBottom: espacement.xl },
  champ: { width: "100%", marginBottom: espacement.md },
  libelle: { color: colors.texteSecondaire, fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    paddingHorizontal: espacement.md,
    paddingVertical: 12,
    color: colors.texte,
  },
  emailValeur: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    paddingHorizontal: espacement.md,
    paddingVertical: 12,
    color: colors.texteSecondaire,
  },
  boutonPrincipal: {
    width: "100%",
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: espacement.md,
  },
  boutonPrincipalTexte: { color: colors.fond, fontWeight: "700" },
  boutonDeconnexion: { marginTop: espacement.xl },
  boutonDeconnexionTexte: { color: colors.danger, fontSize: 14, fontWeight: "600" },
});
