import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ContentCard } from "@/components/ContentCard";
import { EcranConteneur } from "@/components/EcranConteneur";
import { LiveBadge } from "@/components/LiveBadge";
import { AccesRapideItem, QuickAccessGrid } from "@/components/QuickAccessGrid";
import { SectionHeader } from "@/components/SectionHeader";
import { usePlayer } from "@/context/PlayerContext";
import {
  emissionActuelle,
  emissionSuivante,
  paysAudience,
  podcasts,
  predications,
  versetDuJour,
} from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";
import { config } from "@/lib/config";

export function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { lireDirect, pisteActuelle, enLecture, mettreEnPause } = usePlayer();

  const enDirectActif = pisteActuelle?.type === "direct" && enLecture;

  const accesRapide: AccesRapideItem[] = [
    { cle: "direct", libelle: t("onglets.direct"), icone: "radio", onPress: () => navigation.navigate("Direct") },
    { cle: "podcasts", libelle: t("podcasts.titre"), icone: "headset", onPress: () => navigation.navigate("MediaStack", { screen: "Podcasts" }) },
    { cle: "predications", libelle: t("predications.titre"), icone: "book", onPress: () => navigation.navigate("MediaStack", { screen: "Predications" }) },
    { cle: "bible", libelle: t("bible.titre"), icone: "bookmark", onPress: () => navigation.navigate("PrierStack", { screen: "Bible" }) },
    { cle: "priere", libelle: t("priere.titre"), icone: "heart", onPress: () => navigation.navigate("PrierStack", { screen: "Priere" }) },
    { cle: "videos", libelle: t("video.titre"), icone: "videocam", onPress: () => navigation.navigate("MediaStack", { screen: "Videos" }) },
    { cle: "evenements", libelle: t("evenements.titre"), icone: "calendar", onPress: () => navigation.navigate("Evenements") },
    { cle: "communaute", libelle: t("communaute.titre"), icone: "people", onPress: () => navigation.navigate("Communaute") },
  ];

  return (
    <EcranConteneur>
      <View style={styles.entete}>
        <View>
          <Text style={styles.titre}>{config.nomOfficiel}</Text>
          <Text style={styles.signature}>{config.signature}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Recherche")} hitSlop={10}>
          <View style={styles.boutonRecherche}>
            <Text style={styles.boutonRechercheTexte}>🔍</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.cartePlayer}
        activeOpacity={0.85}
        onPress={() => (enDirectActif ? mettreEnPause() : lireDirect())}
      >
        <Image source={{ uri: emissionActuelle.visuelUrl }} style={styles.imagePlayer} />
        <View style={styles.infosPlayer}>
          <LiveBadge />
          <Text style={styles.emissionTitre} numberOfLines={1}>
            {t("accueil.enCeMoment")}: {emissionActuelle.titre}
          </Text>
          <Text style={styles.emissionAnimateur} numberOfLines={1}>
            {emissionActuelle.animateur}
          </Text>
          <Text style={styles.emissionSuivante} numberOfLines={1}>
            {t("accueil.aSuivre")}: {emissionSuivante.titre} · {emissionSuivante.heureDebut}
          </Text>
        </View>
        <Text style={styles.iconePlayPause}>{enDirectActif ? "⏸" : "▶"}</Text>
      </TouchableOpacity>

      <SectionHeader titre={t("accueil.accesRapide")} />
      <QuickAccessGrid items={accesRapide} />

      <TouchableOpacity
        style={styles.carteVerset}
        onPress={() => navigation.navigate("PrierStack", { screen: "Bible" })}
        activeOpacity={0.85}
      >
        <Text style={styles.verseLabel}>{t("bible.versetDuJour")}</Text>
        <Text style={styles.verseTexte}>« {versetDuJour.texte} »</Text>
        <Text style={styles.verseRef}>{versetDuJour.reference} — {versetDuJour.traduction}</Text>
      </TouchableOpacity>

      <SectionHeader
        titre={t("podcasts.titre")}
        texteAction={t("commun.voirTout")}
        onAction={() => navigation.navigate("MediaStack", { screen: "Podcasts" })}
      />
      <HorizontalList
        data={podcasts}
        onPress={(id) => navigation.navigate("MediaStack", { screen: "DetailPodcast", params: { id } })}
      />

      <SectionHeader
        titre={t("predications.titre")}
        texteAction={t("commun.voirTout")}
        onAction={() => navigation.navigate("MediaStack", { screen: "Predications" })}
      />
      <HorizontalList
        data={predications}
        onPress={(id) => navigation.navigate("MediaStack", { screen: "DetailPredication", params: { id } })}
      />

      <SectionHeader titre={t("accueil.audienceMondiale")} />
      <View style={styles.carteAudience}>
        {paysAudience.map((ligne) => (
          <View key={ligne.pays} style={styles.ligneAudience}>
            <Text style={styles.paysAudience}>{ligne.pays}</Text>
            <Text style={styles.chiffreAudience}>{ligne.auditeurs.toLocaleString("fr-FR")}</Text>
          </View>
        ))}
      </View>
    </EcranConteneur>
  );
}

function HorizontalList({
  data,
  onPress,
}: {
  data: { id: string; titre: string; imageUrl: string; animateur?: string; predicateur?: string }[];
  onPress: (id: string) => void;
}) {
  return (
    <View style={styles.listeHorizontale}>
      {data.map((item) => (
        <ContentCard
          key={item.id}
          titre={item.titre}
          sousTitre={item.animateur ?? item.predicateur}
          imageUrl={item.imageUrl}
          onPress={() => onPress(item.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  entete: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: espacement.md,
    paddingTop: espacement.sm,
    marginBottom: espacement.md,
  },
  titre: { color: colors.texte, fontSize: 18, fontWeight: "800" },
  signature: { color: colors.texteSecondaire, fontSize: 12, marginTop: 2, maxWidth: 240 },
  boutonRecherche: {
    width: 36,
    height: 36,
    borderRadius: rayon.rond,
    backgroundColor: colors.carte,
    alignItems: "center",
    justifyContent: "center",
  },
  boutonRechercheTexte: { fontSize: 15 },
  cartePlayer: {
    marginHorizontal: espacement.md,
    backgroundColor: colors.carte,
    borderRadius: rayon.lg,
    padding: espacement.sm,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: espacement.lg,
  },
  imagePlayer: { width: 64, height: 64, borderRadius: rayon.md },
  infosPlayer: { flex: 1, marginLeft: espacement.sm, gap: 3 },
  emissionTitre: { color: colors.texte, fontWeight: "700", fontSize: 13, marginTop: 4 },
  emissionAnimateur: { color: colors.texteSecondaire, fontSize: 12 },
  emissionSuivante: { color: colors.texteSecondaire, fontSize: 11 },
  iconePlayPause: { color: colors.primaire, fontSize: 26, paddingHorizontal: espacement.sm },
  carteVerset: {
    marginHorizontal: espacement.md,
    backgroundColor: colors.fondClair,
    borderRadius: rayon.lg,
    padding: espacement.md,
    marginBottom: espacement.lg,
    borderWidth: 1,
    borderColor: colors.primaireSombre,
  },
  verseLabel: { color: colors.primaire, fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  verseTexte: { color: colors.texte, fontSize: 16, fontStyle: "italic", marginTop: 8, lineHeight: 22 },
  verseRef: { color: colors.texteSecondaire, fontSize: 12, marginTop: 8 },
  listeHorizontale: {
    flexDirection: "row",
    paddingHorizontal: espacement.md,
    marginBottom: espacement.lg,
  },
  carteAudience: {
    marginHorizontal: espacement.md,
    backgroundColor: colors.carte,
    borderRadius: rayon.lg,
    padding: espacement.md,
  },
  ligneAudience: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separateur,
  },
  paysAudience: { color: colors.texte, fontSize: 14 },
  chiffreAudience: { color: colors.primaire, fontSize: 14, fontWeight: "700" },
});
