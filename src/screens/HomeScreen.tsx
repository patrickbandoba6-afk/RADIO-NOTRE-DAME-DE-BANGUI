import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CarteArticleLigne, CarteArticleUne } from "@/components/CarteArticle";
import { EcranConteneur } from "@/components/EcranConteneur";
import { SectionHeader } from "@/components/SectionHeader";
import { usePlayer } from "@/context/PlayerContext";
import { useContenu } from "@/hooks/useContenu";
import { formaterDuree, minutesDepuisMinuit } from "@/lib/format";
import { config } from "@/lib/config";
import {
  chargerAnnonces,
  chargerArticles,
  chargerEpisodes,
  chargerEvangileDuJour,
  chargerEvenements,
  chargerGrille,
  chargerVersetDuJour,
} from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { Evenement, VersetDuJour } from "@/types";
import type {
  Annonce,
  Article,
  CreneauProgramme,
  Episode,
  EvangileDuJour,
} from "@/types/editorial";

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const {
    lireDirect,
    pisteActuelle,
    enLecture,
    enMemoireTampon,
    mettreEnPause,
    titreEnCours,
  } = usePlayer();

  const { donnees: articles } = useContenu<Article[]>(() => chargerArticles(), []);
  const { donnees: grille } = useContenu<CreneauProgramme[]>(chargerGrille, []);
  const { donnees: episodes } = useContenu<Episode[]>(() => chargerEpisodes(), []);
  const { donnees: evenements } = useContenu<Evenement[]>(chargerEvenements, []);
  const { donnees: annonces } = useContenu<Annonce[]>(chargerAnnonces, []);
  const { donnees: evangile } = useContenu<EvangileDuJour | null>(chargerEvangileDuJour, null);
  const { donnees: verset } = useContenu<VersetDuJour | null>(chargerVersetDuJour, null);

  const enDirectActif = pisteActuelle?.type === "direct" && enLecture;

  const { emissionActuelle, emissionSuivante } = useMemo(() => {
    const maintenant = new Date();
    const jour = maintenant.getDay();
    const minutes = maintenant.getHours() * 60 + maintenant.getMinutes();
    const duJour = grille
      .filter((c) => c.jourSemaine === jour)
      .sort((a, b) => minutesDepuisMinuit(a.heureDebut) - minutesDepuisMinuit(b.heureDebut));

    const actuelle = duJour.find(
      (c) =>
        minutes >= minutesDepuisMinuit(c.heureDebut) && minutes < minutesDepuisMinuit(c.heureFin)
    );
    const suivante = duJour.find((c) => minutesDepuisMinuit(c.heureDebut) > minutes);
    return { emissionActuelle: actuelle, emissionSuivante: suivante };
  }, [grille]);

  const aLaUne = articles.filter((a) => a.aLaUne);
  const dernieres = articles.filter((a) => !a.aLaUne).slice(0, 4);
  const prochainsEvenements = evenements
    .filter((e) => new Date(e.dateDebutISO) >= new Date())
    .slice(0, 3);

  return (
    <EcranConteneur>
      {/* En-tête */}
      <View style={styles.entete}>
        <View style={styles.enteteMarque}>
          <Image
            source={require("../../assets/logo-rndb.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.nomStation}>RADIO NOTRE-DAME</Text>
            <Text style={styles.frequenceEntete}>
              {config.frequence} · {config.ville}
            </Text>
          </View>
        </View>
        <View style={styles.enteteActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Recherche")}
            hitSlop={8}
            style={styles.rond}
          >
            <Ionicons name="search" size={18} color={colors.texte} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
            hitSlop={8}
            style={styles.rond}
          >
            <Ionicons name="notifications-outline" size={18} color={colors.texte} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Carte du direct */}
      <LinearGradient
        colors={[colors.carte, colors.fondClair]}
        style={styles.carteDirect}
      >
        <View style={styles.badgeDirect}>
          <View style={styles.pointDirect} />
          <Text style={styles.badgeDirectTexte}>EN DIRECT</Text>
        </View>

        {emissionActuelle ? (
          <>
            <Image source={{ uri: emissionActuelle.imageUrl }} style={styles.pochetteDirect} />
            <Text style={styles.titreDirect} numberOfLines={2}>
              {emissionActuelle.emissionNom}
            </Text>
            <Text style={styles.animateurDirect} numberOfLines={1}>
              par {emissionActuelle.animateur}
            </Text>
          </>
        ) : (
          <>
            <Image
              source={require("../../assets/logo-rndb.png")}
              style={styles.pochetteDirect}
              resizeMode="contain"
            />
            <Text style={styles.titreDirect}>{config.nomOfficiel}</Text>
            <Text style={styles.animateurDirect} numberOfLines={1}>
              {titreEnCours}
            </Text>
          </>
        )}

        <View style={styles.boutonsDirect}>
          <TouchableOpacity
            style={styles.boutonEcouter}
            onPress={() => (enDirectActif ? mettreEnPause() : lireDirect())}
            activeOpacity={0.9}
          >
            {enMemoireTampon && pisteActuelle?.type === "direct" ? (
              <ActivityIndicator color={colors.fond} size="small" />
            ) : (
              <Ionicons name={enDirectActif ? "pause" : "play"} size={18} color={colors.fond} />
            )}
            <Text style={styles.boutonEcouterTexte}>
              {enDirectActif ? "PAUSE" : "ÉCOUTER"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.boutonDon}
            onPress={() => navigation.navigate("Dons")}
            activeOpacity={0.9}
          >
            <Text style={styles.boutonDonTexte}>JE FAIS UN DON</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* À suivre */}
      {emissionSuivante ? (
        <TouchableOpacity
          style={styles.carteASuivre}
          onPress={() => navigation.navigate("Grille")}
          activeOpacity={0.85}
        >
          <Text style={styles.libelleASuivre}>À suivre à {emissionSuivante.heureDebut}</Text>
          <View style={styles.ligneASuivre}>
            <Image source={{ uri: emissionSuivante.imageUrl }} style={styles.imageASuivre} />
            <View style={{ flex: 1 }}>
              <Text style={styles.titreASuivre} numberOfLines={1}>
                {emissionSuivante.emissionNom}
              </Text>
              <Text style={styles.animateurASuivre} numberOfLines={1}>
                par {emissionSuivante.animateur}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.texteSecondaire} />
          </View>
        </TouchableOpacity>
      ) : null}

      {/* Évangile du jour */}
      {evangile ? (
        <TouchableOpacity
          style={styles.carteEvangile}
          onPress={() => navigation.navigate("Evangile")}
          activeOpacity={0.85}
        >
          <Text style={styles.libelleEvangile}>Évangile du jour</Text>
          <Text style={styles.referenceEvangile}>{evangile.evangile.reference}</Text>
          <Text style={styles.texteEvangile} numberOfLines={3}>
            « {evangile.evangile.texte} »
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* Verset du jour */}
      {verset ? (
        <TouchableOpacity
          style={styles.carteVerset}
          onPress={() => navigation.navigate("Bible")}
          activeOpacity={0.85}
        >
          <Text style={styles.libelleVerset}>Verset du jour</Text>
          <Text style={styles.texteVerset} numberOfLines={3}>
            « {verset.texte} »
          </Text>
          <Text style={styles.referenceVerset}>
            {verset.reference} — {verset.traduction}
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* À la une */}
      {aLaUne.length > 0 ? (
        <>
          <SectionHeader
            titre="À la une"
            texteAction="Voir tout"
            onAction={() => navigation.navigate("ActualitesStack")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listeHorizontale}
          >
            {aLaUne.map((article) => (
              <CarteArticleUne
                key={article.id}
                article={article}
                onPress={() =>
                  navigation.navigate("ActualitesStack", {
                    screen: "Article",
                    params: { id: article.id },
                  })
                }
              />
            ))}
          </ScrollView>
        </>
      ) : null}

      {/* Dernières actualités */}
      {dernieres.length > 0 ? (
        <>
          <SectionHeader
            titre="Dernières actualités"
            texteAction="Voir tout"
            onAction={() => navigation.navigate("ActualitesStack")}
          />
          <View style={styles.blocListe}>
            {dernieres.map((article) => (
              <CarteArticleLigne
                key={article.id}
                article={article}
                onPress={() =>
                  navigation.navigate("ActualitesStack", {
                    screen: "Article",
                    params: { id: article.id },
                  })
                }
              />
            ))}
          </View>
        </>
      ) : null}

      {/* Derniers podcasts */}
      {episodes.length > 0 ? (
        <>
          <SectionHeader
            titre="Derniers podcasts"
            texteAction="Voir tout"
            onAction={() => navigation.navigate("PodcastsStack")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listeHorizontale}
          >
            {episodes.slice(0, 6).map((episode) => (
              <TouchableOpacity
                key={episode.id}
                style={styles.carteEpisode}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate("PodcastsStack", {
                    screen: "DetailEmission",
                    params: { id: episode.emissionId },
                  })
                }
              >
                <Image source={{ uri: episode.imageUrl }} style={styles.imageEpisode} />
                <Text style={styles.titreEpisode} numberOfLines={2}>
                  {episode.titre}
                </Text>
                <Text style={styles.dureeEpisode}>{formaterDuree(episode.dureeSecondes)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      ) : null}

      {/* Prochains événements */}
      {prochainsEvenements.length > 0 ? (
        <>
          <SectionHeader
            titre="Prochains événements"
            texteAction="Agenda"
            onAction={() => navigation.navigate("AgendaStack")}
          />
          <View style={styles.blocListe}>
            {prochainsEvenements.map((evenement) => (
              <TouchableOpacity
                key={evenement.id}
                style={styles.ligneEvenement}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate("AgendaStack", {
                    screen: "DetailEvenement",
                    params: { id: evenement.id },
                  })
                }
              >
                <View style={styles.blocDate}>
                  <Text style={styles.jour}>{new Date(evenement.dateDebutISO).getDate()}</Text>
                  <Text style={styles.mois}>
                    {new Date(evenement.dateDebutISO).toLocaleDateString("fr-FR", {
                      month: "short",
                    })}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.titreEvenement} numberOfLines={2}>
                    {evenement.titre}
                  </Text>
                  {evenement.lieu ? (
                    <Text style={styles.lieuEvenement} numberOfLines={1}>
                      {evenement.lieu}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : null}

      {/* Annonces */}
      {annonces.length > 0 ? (
        <>
          <SectionHeader
            titre="Annonces"
            texteAction="Voir tout"
            onAction={() => navigation.navigate("AgendaStack", { screen: "Annonces" })}
          />
          <View style={styles.blocListe}>
            {annonces.slice(0, 3).map((annonce) => (
              <TouchableOpacity
                key={annonce.id}
                style={styles.ligneAnnonce}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate("AgendaStack", {
                    screen: "DetailAnnonce",
                    params: { id: annonce.id },
                  })
                }
              >
                <Ionicons name="megaphone-outline" size={18} color={colors.primaire} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.titreAnnonce} numberOfLines={2}>
                    {annonce.titre}
                  </Text>
                  <Text style={styles.organisateurAnnonce} numberOfLines={1}>
                    {annonce.organisateur}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : null}
    </EcranConteneur>
  );
}

const styles = StyleSheet.create({
  entete: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: espacement.md,
    paddingTop: espacement.sm,
    marginBottom: espacement.md,
  },
  enteteMarque: { flexDirection: "row", alignItems: "center", gap: espacement.sm },
  logo: { width: 42, height: 42 },
  nomStation: { color: colors.texte, fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },
  frequenceEntete: { color: colors.primaire, fontSize: 11, fontWeight: "700", marginTop: 2 },
  enteteActions: { flexDirection: "row", gap: espacement.sm },
  rond: {
    width: 36,
    height: 36,
    borderRadius: rayon.rond,
    backgroundColor: colors.carte,
    alignItems: "center",
    justifyContent: "center",
  },

  carteDirect: {
    marginHorizontal: espacement.md,
    borderRadius: rayon.lg,
    padding: espacement.md,
    alignItems: "center",
    marginBottom: espacement.md,
  },
  badgeDirect: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.blanc,
    borderRadius: rayon.rond,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pointDirect: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.danger },
  badgeDirectTexte: { color: colors.fond, fontSize: 10, fontWeight: "800" },
  pochetteDirect: {
    width: 132,
    height: 132,
    borderRadius: rayon.md,
    marginTop: espacement.md,
    backgroundColor: colors.fondClair,
  },
  titreDirect: {
    color: colors.texte,
    fontSize: 18,
    fontWeight: "800",
    marginTop: espacement.sm,
    textAlign: "center",
  },
  animateurDirect: {
    color: colors.texteSecondaire,
    fontSize: 13,
    marginTop: 3,
    textAlign: "center",
  },
  boutonsDirect: { flexDirection: "row", gap: espacement.sm, marginTop: espacement.md },
  boutonEcouter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingHorizontal: espacement.lg,
    paddingVertical: 11,
  },
  boutonEcouterTexte: { color: colors.fond, fontWeight: "800", fontSize: 13 },
  boutonDon: {
    borderWidth: 1,
    borderColor: colors.texte,
    borderRadius: rayon.rond,
    paddingHorizontal: espacement.md,
    paddingVertical: 11,
    justifyContent: "center",
  },
  boutonDonTexte: { color: colors.texte, fontWeight: "700", fontSize: 12 },

  carteASuivre: {
    marginHorizontal: espacement.md,
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.md,
    marginBottom: espacement.md,
  },
  libelleASuivre: { color: colors.texte, fontSize: 14, fontWeight: "700" },
  ligneASuivre: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.sm,
    marginTop: espacement.sm,
  },
  imageASuivre: { width: 46, height: 46, borderRadius: rayon.sm, backgroundColor: colors.fondClair },
  titreASuivre: { color: colors.texte, fontSize: 14, fontWeight: "700" },
  animateurASuivre: { color: colors.texteSecondaire, fontSize: 12, marginTop: 2 },

  carteEvangile: {
    marginHorizontal: espacement.md,
    backgroundColor: colors.fondClair,
    borderRadius: rayon.lg,
    padding: espacement.md,
    marginBottom: espacement.md,
    borderWidth: 1,
    borderColor: colors.primaireSombre,
  },
  libelleEvangile: {
    color: colors.primaire,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  referenceEvangile: { color: colors.texte, fontSize: 13, fontWeight: "700", marginTop: 4 },
  texteEvangile: {
    color: colors.texte,
    fontSize: 15,
    fontStyle: "italic",
    lineHeight: 22,
    marginTop: 6,
  },
  carteVerset: {
    marginHorizontal: espacement.md,
    backgroundColor: colors.carte,
    borderRadius: rayon.lg,
    padding: espacement.md,
    marginBottom: espacement.md,
    borderWidth: 1,
    borderColor: colors.primaireSombre,
  },
  libelleVerset: {
    color: colors.primaire,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  texteVerset: {
    color: colors.texte,
    fontSize: 15,
    fontStyle: "italic",
    lineHeight: 22,
    marginTop: 6,
  },
  referenceVerset: { color: colors.texteSecondaire, fontSize: 12, marginTop: 6 },

  listeHorizontale: { paddingHorizontal: espacement.md, paddingBottom: espacement.md },
  blocListe: { paddingHorizontal: espacement.md, marginBottom: espacement.md },

  carteEpisode: { width: 132, marginRight: espacement.md },
  imageEpisode: {
    width: 132,
    height: 132,
    borderRadius: rayon.md,
    backgroundColor: colors.carte,
  },
  titreEpisode: { color: colors.texte, fontSize: 12, fontWeight: "700", marginTop: 8, lineHeight: 17 },
  dureeEpisode: { color: colors.texteSecondaire, fontSize: 11, marginTop: 2 },

  ligneEvenement: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.sm,
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.sm,
    marginBottom: espacement.sm,
  },
  blocDate: {
    width: 44,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: rayon.sm,
    backgroundColor: colors.fondClair,
  },
  jour: { color: colors.primaire, fontSize: 17, fontWeight: "800" },
  mois: { color: colors.texteSecondaire, fontSize: 9, textTransform: "uppercase" },
  titreEvenement: { color: colors.texte, fontSize: 13, fontWeight: "700", lineHeight: 18 },
  lieuEvenement: { color: colors.texteSecondaire, fontSize: 11, marginTop: 2 },

  ligneAnnonce: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.sm,
    backgroundColor: colors.carte,
    borderRadius: rayon.md,
    padding: espacement.md,
    marginBottom: espacement.sm,
  },
  titreAnnonce: { color: colors.texte, fontSize: 13, fontWeight: "700", lineHeight: 18 },
  organisateurAnnonce: { color: colors.texteSecondaire, fontSize: 11, marginTop: 2 },
});
