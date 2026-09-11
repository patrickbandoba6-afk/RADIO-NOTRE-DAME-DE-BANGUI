import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { appeler, envoyerEmail, ouvrirItineraire, ouvrirLien } from "@/lib/format";
import { config } from "@/lib/config";
import { colors, espacement, rayon } from "@/theme/colors";

export function ContactScreen() {
  const coordonnees = [
    { icone: "call-outline" as const, libelle: "Téléphone", valeur: config.telephone, action: () => config.telephone && appeler(config.telephone) },
    { icone: "mail-outline" as const, libelle: "Email", valeur: config.email, action: () => config.email && envoyerEmail(config.email) },
    { icone: "location-outline" as const, libelle: "Adresse", valeur: config.adresse, action: () => config.adresse && ouvrirItineraire(config.adresse) },
    { icone: "globe-outline" as const, libelle: "Site web", valeur: config.siteWeb, action: () => config.siteWeb && ouvrirLien(config.siteWeb) },
    { icone: "logo-facebook" as const, libelle: "Facebook", valeur: config.facebook, action: () => config.facebook && ouvrirLien(config.facebook) },
  ];

  const renseignees = coordonnees.filter((c) => c.valeur);

  return (
    <ScrollView style={styles.conteneur} contentContainerStyle={{ padding: espacement.md, paddingBottom: 150 }}>
      <View style={styles.entete}>
        <Image
          source={require("../../../assets/logo-rndb.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.nom}>{config.nomOfficiel}</Text>
        <Text style={styles.slogan}>« {config.slogan} »</Text>
      </View>

      <View style={styles.carteFrequence}>
        <Text style={styles.etiquette}>Fréquence FM</Text>
        <Text style={styles.frequence}>{config.frequenceMhz}</Text>
        <Text style={styles.zone}>
          {config.zoneDiffusion} · {config.pays}
        </Text>
      </View>

      <View style={styles.blocInfos}>
        <LigneFiche libelle="Institution" valeur={config.institution} />
        <LigneFiche libelle="Premières émissions" valeur={config.premieresEmissions} />
        <LigneFiche libelle="Langues" valeur={config.langues.join(" · ")} />
        <LigneFiche libelle="Ville" valeur={`${config.ville}, ${config.pays}`} />
      </View>

      <Text style={styles.titreSection}>Nous contacter</Text>

      {renseignees.length === 0 ? (
        <View style={styles.blocAConfigurer}>
          <Ionicons name="information-circle-outline" size={20} color={colors.attente} />
          <Text style={styles.texteAConfigurer}>
            Les coordonnées de la radio ne sont pas encore renseignées. Elles peuvent être
            ajoutées dans les paramètres de l'application (fichier .env) ou depuis le
            back-office.
          </Text>
        </View>
      ) : (
        <View style={styles.bloc}>
          {renseignees.map((entree, index) => (
            <TouchableOpacity
              key={entree.libelle}
              style={[styles.ligne, index < renseignees.length - 1 && styles.ligneBordure]}
              onPress={entree.action}
            >
              <Ionicons name={entree.icone} size={19} color={colors.primaire} />
              <View style={{ flex: 1 }}>
                <Text style={styles.ligneLibelle}>{entree.libelle}</Text>
                <Text style={styles.ligneValeur}>{entree.valeur}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.texteSecondaire} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.boutonStreaming}
        onPress={() => ouvrirLien(config.pageStreaming)}
      >
        <Ionicons name="radio-outline" size={18} color={colors.primaire} />
        <Text style={styles.boutonStreamingTexte}>Page d'écoute officielle</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function LigneFiche({ libelle, valeur }: { libelle: string; valeur: string }) {
  return (
    <View style={styles.ligneFiche}>
      <Text style={styles.ficheLibelle}>{libelle}</Text>
      <Text style={styles.ficheValeur}>{valeur}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  entete: { alignItems: "center", gap: 6, marginBottom: espacement.lg },
  logo: { width: 92, height: 92 },
  nom: { color: colors.texte, fontSize: 17, fontWeight: "800", textAlign: "center" },
  slogan: { color: colors.texteSecondaire, fontSize: 13, fontStyle: "italic" },
  carteFrequence: {
    backgroundColor: colors.fondClair,
    borderRadius: rayon.lg,
    padding: espacement.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primaireSombre,
  },
  etiquette: {
    color: colors.primaire,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  frequence: { color: colors.texte, fontSize: 34, fontWeight: "800", marginTop: 4 },
  zone: { color: colors.texteSecondaire, fontSize: 12, marginTop: 4, textAlign: "center" },
  blocInfos: {
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.md,
    marginTop: espacement.md,
    gap: espacement.sm,
  },
  ligneFiche: { flexDirection: "row", justifyContent: "space-between", gap: espacement.sm },
  ficheLibelle: { color: colors.texteSecondaire, fontSize: 12 },
  ficheValeur: { color: colors.texte, fontSize: 12, fontWeight: "600", flexShrink: 1, textAlign: "right" },
  titreSection: {
    color: colors.texte,
    fontSize: 17,
    fontWeight: "700",
    marginTop: espacement.lg,
    marginBottom: espacement.sm,
  },
  bloc: { backgroundColor: colors.carte, borderRadius: rayon.md, overflow: "hidden" },
  ligne: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.sm,
    paddingHorizontal: espacement.md,
    paddingVertical: 12,
  },
  ligneBordure: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separateur,
  },
  ligneLibelle: { color: colors.texteSecondaire, fontSize: 11 },
  ligneValeur: { color: colors.texte, fontSize: 14, marginTop: 1 },
  blocAConfigurer: {
    flexDirection: "row",
    gap: espacement.sm,
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.md,
  },
  texteAConfigurer: { flex: 1, color: colors.texteSecondaire, fontSize: 12, lineHeight: 18 },
  boutonStreaming: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingVertical: 12,
    marginTop: espacement.lg,
  },
  boutonStreamingTexte: { color: colors.primaire, fontWeight: "700" },
});
