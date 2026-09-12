import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { alerter } from "@/lib/alerte";
import { supabase } from "@/lib/supabase";
import { colors, espacement, rayon } from "@/theme/colors";

const BUCKET = "signalements-citoyens";

const CATEGORIES = [
  { valeur: "information", libelle: "Information" },
  { valeur: "accident", libelle: "Accident" },
  { valeur: "demande_diffusion", libelle: "Demande de diffusion" },
  { valeur: "autre", libelle: "Autre" },
] as const;

export function EnvoyerInfoScreen() {
  const { utilisateur } = useAuth();
  const [categorie, setCategorie] = useState<(typeof CATEGORIES)[number]["valeur"]>("information");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  if (!utilisateur || utilisateur.estInvite) {
    return (
      <View style={styles.conteneurVide}>
        <Ionicons name="lock-closed-outline" size={40} color={colors.texteSecondaire} />
        <Text style={styles.texteVide}>
          Connectez-vous pour envoyer une information à la radio.
        </Text>
      </View>
    );
  }

  async function choisirPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alerter("Permission requise", "Autorisez l'accès à vos photos pour joindre une image.");
      return;
    }
    const resultat = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!resultat.canceled && resultat.assets[0]) {
      setPhotoUri(resultat.assets[0].uri);
    }
  }

  async function envoyer() {
    if (!titre.trim() || !supabase || !utilisateur) return;
    setEnvoi(true);
    try {
      let imageUrl: string | null = null;
      if (photoUri) {
        const reponse = await fetch(photoUri);
        const donnees = await reponse.arrayBuffer();
        const chemin = `${utilisateur.id}/${Date.now()}.jpg`;
        const { error: erreurEnvoi } = await supabase.storage
          .from(BUCKET)
          .upload(chemin, donnees, { contentType: "image/jpeg" });
        if (erreurEnvoi) throw erreurEnvoi;
        imageUrl = chemin;
      }

      const { error } = await supabase.from("signalements_citoyens").insert({
        utilisateur_id: utilisateur.id,
        categorie,
        titre: titre.trim(),
        description: description.trim() || null,
        image_url: imageUrl,
      });
      if (error) throw error;

      alerter(
        "Information envoyée",
        "Merci ! Votre message a été transmis à l'équipe de la radio, qui décidera de la suite à donner."
      );
      setTitre("");
      setDescription("");
      setPhotoUri(null);
      setCategorie("information");
    } catch (e) {
      alerter("Échec de l'envoi", e instanceof Error ? e.message : "Veuillez réessayer.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <ScrollView style={styles.conteneur} contentContainerStyle={{ padding: espacement.md, paddingBottom: 140 }}>
      <Text style={styles.intro}>
        Vous avez vu un accident, une information à partager, ou une demande de diffusion ?
        Envoyez-la ici : seuls l&apos;administrateur et son équipe la reçoivent — elle n&apos;est
        jamais publique. C&apos;est la radio qui décide si et comment elle en parle à l&apos;antenne.
      </Text>

      <Text style={styles.libelle}>Catégorie</Text>
      <View style={styles.categories}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.valeur}
            style={[styles.puce, categorie === c.valeur && styles.puceActive]}
            onPress={() => setCategorie(c.valeur)}
          >
            <Text style={[styles.puceTexte, categorie === c.valeur && styles.puceTexteActive]}>
              {c.libelle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.libelle}>Titre</Text>
      <TextInput
        style={styles.input}
        placeholder="Résumez en quelques mots"
        placeholderTextColor={colors.texteSecondaire}
        value={titre}
        onChangeText={setTitre}
      />

      <Text style={styles.libelle}>Description</Text>
      <TextInput
        style={[styles.input, styles.inputMultiligne]}
        placeholder="Décrivez ce qui se passe, où, et quand…"
        placeholderTextColor={colors.texteSecondaire}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity style={styles.boutonPhoto} onPress={choisirPhoto}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.apercuPhoto} />
        ) : (
          <>
            <Ionicons name="camera-outline" size={20} color={colors.primaire} />
            <Text style={styles.boutonPhotoTexte}>Joindre une photo</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.boutonEnvoyer}
        onPress={envoyer}
        disabled={envoi || !titre.trim()}
      >
        {envoi ? (
          <ActivityIndicator color={colors.fond} />
        ) : (
          <Text style={styles.boutonEnvoyerTexte}>Envoyer à la radio</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  conteneurVide: { flex: 1, backgroundColor: colors.fond, alignItems: "center", justifyContent: "center", padding: espacement.xl, gap: espacement.md },
  texteVide: { color: colors.texteSecondaire, fontSize: 14, textAlign: "center" },
  intro: { color: colors.texteSecondaire, fontSize: 13, lineHeight: 19, marginBottom: espacement.lg },
  libelle: { color: colors.texte, fontSize: 13, fontWeight: "700", marginBottom: 8, marginTop: espacement.md },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  puce: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: rayon.rond,
    backgroundColor: colors.carte,
  },
  puceActive: { backgroundColor: colors.primaire },
  puceTexte: { color: colors.texteSecondaire, fontSize: 12.5, fontWeight: "600" },
  puceTexteActive: { color: colors.fond },
  input: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    paddingHorizontal: espacement.md,
    paddingVertical: 12,
    color: colors.texte,
  },
  inputMultiligne: { minHeight: 100, textAlignVertical: "top" },
  boutonPhoto: {
    marginTop: espacement.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    paddingVertical: 14,
  },
  boutonPhotoTexte: { color: colors.primaire, fontSize: 13, fontWeight: "600" },
  apercuPhoto: { width: "100%", height: 160, borderRadius: rayon.md },
  boutonEnvoyer: {
    marginTop: espacement.xl,
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingVertical: 14,
    alignItems: "center",
  },
  boutonEnvoyerTexte: { color: colors.fond, fontWeight: "700" },
});
