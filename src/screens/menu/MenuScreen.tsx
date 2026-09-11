import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { config } from "@/lib/config";
import { colors, espacement, rayon } from "@/theme/colors";

interface Entree {
  cle: string;
  icone: keyof typeof Ionicons.glyphMap;
  libelle: string;
  onPress: () => void;
}

export function MenuScreen() {
  const navigation = useNavigation<any>();
  const { utilisateur, seDeconnecter } = useAuth();

  const monEspace: Entree[] = [
    {
      cle: "favoris",
      icone: "heart-outline",
      libelle: "Mes favoris",
      onPress: () => navigation.navigate("Favoris"),
    },
    {
      cle: "historique",
      icone: "time-outline",
      libelle: "Mon historique",
      onPress: () => navigation.navigate("Historique"),
    },
    {
      cle: "telechargements",
      icone: "download-outline",
      libelle: "Mes téléchargements",
      onPress: () => navigation.navigate("Telechargements"),
    },
    {
      cle: "notifications",
      icone: "notifications-outline",
      libelle: "Notifications",
      onPress: () => navigation.navigate("Notifications"),
    },
  ];

  const spiritualite: Entree[] = [
    {
      cle: "majournee",
      icone: "sunny-outline",
      libelle: "Ma journée avec Dieu",
      onPress: () => navigation.navigate("MaJournee"),
    },
    {
      cle: "evangile",
      icone: "book-outline",
      libelle: "Évangile du jour",
      onPress: () => navigation.navigate("Evangile"),
    },
    {
      cle: "prieres",
      icone: "heart-circle-outline",
      libelle: "Prières",
      onPress: () => navigation.navigate("Prieres"),
    },
    {
      cle: "bible",
      icone: "bookmark-outline",
      libelle: "Bible",
      onPress: () => navigation.navigate("Bible"),
    },
    {
      cle: "homelies",
      icone: "mic-outline",
      libelle: "Homélies",
      onPress: () => navigation.navigate("Homelies"),
    },
    {
      cle: "priere",
      icone: "hand-left-outline",
      libelle: "Demandes de prière",
      onPress: () => navigation.navigate("Priere"),
    },
    {
      cle: "temoignages",
      icone: "chatbubbles-outline",
      libelle: "Témoignages",
      onPress: () => navigation.navigate("Temoignages"),
    },
  ];

  const decouvrir: Entree[] = [
    {
      cle: "emissions",
      icone: "radio-outline",
      libelle: "Émissions",
      onPress: () => navigation.navigate("Emissions"),
    },
    {
      cle: "grille",
      icone: "grid-outline",
      libelle: "Grille des programmes",
      onPress: () => navigation.navigate("Grille"),
    },
    {
      cle: "videos",
      icone: "videocam-outline",
      libelle: "Vidéos & messes",
      onPress: () => navigation.navigate("Videos"),
    },
    {
      cle: "dossiers",
      icone: "albums-outline",
      libelle: "Dossiers",
      onPress: () => navigation.navigate("Dossiers"),
    },
    {
      cle: "communiques",
      icone: "document-text-outline",
      libelle: "Communiqués",
      onPress: () => navigation.navigate("Communiques"),
    },
    {
      cle: "paroisses",
      icone: "business-outline",
      libelle: "Paroisses & diocèses",
      onPress: () => navigation.navigate("Paroisses"),
    },
    {
      cle: "communaute",
      icone: "people-outline",
      libelle: "Communauté",
      onPress: () => navigation.navigate("Communaute"),
    },
  ];

  const laRadio: Entree[] = [
    {
      cle: "contact",
      icone: "call-outline",
      libelle: "Contact & fréquences",
      onPress: () => navigation.navigate("Contact"),
    },
    {
      cle: "dons",
      icone: "gift-outline",
      libelle: "Soutenir la radio",
      onPress: () => navigation.navigate("Dons"),
    },
    {
      cle: "parametres",
      icone: "settings-outline",
      libelle: "Paramètres",
      onPress: () => navigation.navigate("Parametres"),
    },
    {
      cle: "mentionsLegales",
      icone: "document-text-outline",
      libelle: "Mentions légales",
      onPress: () => navigation.navigate("MentionsLegales"),
    },
    {
      cle: "admin",
      icone: "shield-checkmark-outline",
      libelle: "Espace administrateur",
      onPress: () => navigation.navigate("Admin"),
    },
  ];

  return (
    <ScrollView style={styles.conteneur} contentContainerStyle={{ paddingBottom: 150 }}>
      <View style={styles.entete}>
        <Image
          source={require("../../../assets/logo-rndb.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.nomStation}>{config.nomOfficiel}</Text>
          <Text style={styles.frequence}>
            {config.frequence} · {config.ville}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.carteProfil}
        onPress={() =>
          navigation.navigate(
            utilisateur && !utilisateur.estInvite ? "MonProfil" : "Connexion"
          )
        }
      >
        {utilisateur && !utilisateur.estInvite && utilisateur.photoUrl ? (
          <Image source={{ uri: utilisateur.photoUrl }} style={styles.avatarProfil} />
        ) : (
          <Ionicons name="person-circle" size={44} color={colors.primaire} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.nomUtilisateur}>
            {utilisateur ? utilisateur.nom : "Se connecter"}
          </Text>
          <Text style={styles.sousTitreProfil}>
            {utilisateur?.estInvite
              ? "Mode invité"
              : utilisateur
              ? "Voir et modifier mon profil"
              : "Retrouvez vos favoris sur tous vos appareils"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.texteSecondaire} />
      </TouchableOpacity>

      <Section titre="Mon espace" entrees={monEspace} />
      <Section titre="Spiritualité" entrees={spiritualite} />
      <Section titre="Découvrir" entrees={decouvrir} />
      <Section titre="La radio" entrees={laRadio} />

      {utilisateur ? (
        <TouchableOpacity style={styles.deconnexion} onPress={seDeconnecter}>
          <Text style={styles.deconnexionTexte}>Se déconnecter</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.pied}>
        {config.institution} · Depuis le {config.premieresEmissions}
      </Text>
      <Text style={styles.pied}>« {config.slogan} »</Text>
      <Text style={styles.pied}>Développé par Agence Web et Marketing — succursale de GLOBALY_JC</Text>
    </ScrollView>
  );
}

function Section({ titre, entrees }: { titre: string; entrees: Entree[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.titreSection}>{titre}</Text>
      <View style={styles.bloc}>
        {entrees.map((entree, index) => (
          <TouchableOpacity
            key={entree.cle}
            style={[styles.ligne, index < entrees.length - 1 && styles.ligneBordure]}
            onPress={entree.onPress}
          >
            <Ionicons name={entree.icone} size={19} color={colors.primaire} />
            <Text style={styles.ligneTexte}>{entree.libelle}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.texteSecondaire} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  entete: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.sm,
    padding: espacement.md,
    paddingTop: 56,
  },
  logo: { width: 48, height: 48 },
  nomStation: { color: colors.texte, fontSize: 15, fontWeight: "800" },
  frequence: { color: colors.primaire, fontSize: 12, fontWeight: "700", marginTop: 2 },
  carteProfil: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.sm,
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.md,
    marginHorizontal: espacement.md,
  },
  avatarProfil: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.fondClair },
  nomUtilisateur: { color: colors.texte, fontSize: 15, fontWeight: "700" },
  sousTitreProfil: { color: colors.texteSecondaire, fontSize: 12, marginTop: 2 },
  section: { marginTop: espacement.lg },
  titreSection: {
    color: colors.texteSecondaire,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    paddingHorizontal: espacement.md,
    marginBottom: espacement.sm,
  },
  bloc: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    marginHorizontal: espacement.md,
    overflow: "hidden",
  },
  ligne: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.sm,
    paddingHorizontal: espacement.md,
    paddingVertical: 14,
  },
  ligneBordure: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separateur,
  },
  ligneTexte: { flex: 1, color: colors.texte, fontSize: 14 },
  deconnexion: { alignItems: "center", marginTop: espacement.lg },
  deconnexionTexte: { color: colors.danger, fontSize: 14, fontWeight: "600" },
  pied: {
    color: colors.texteSecondaire,
    fontSize: 11,
    textAlign: "center",
    marginTop: espacement.md,
  },
});
