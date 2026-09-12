import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LiveBadge } from "@/components/LiveBadge";
import { usePlayer } from "@/context/PlayerContext";
import { emissionActuelle, emissionSuivante } from "@/data/sampleData";
import { config } from "@/lib/config";
import { ouvrirLien } from "@/lib/format";
import { colors, espacement, rayon } from "@/theme/colors";
import type { QualiteAudio } from "@/types";

const RESEAUX_LIVE = [
  { cle: "liveFacebook" as const, icone: "logo-facebook" as const, libelle: "Facebook" },
  { cle: "liveYoutube" as const, icone: "logo-youtube" as const, libelle: "YouTube" },
  { cle: "liveInstagram" as const, icone: "logo-instagram" as const, libelle: "Instagram" },
  { cle: "liveTiktok" as const, icone: "logo-tiktok" as const, libelle: "TikTok" },
];

const MINUTEURS = [15, 30, 45, 60];
const QUALITES: QualiteAudio[] = ["eco", "standard", "haute"];

export function LiveScreen() {
  const { t } = useTranslation();
  const {
    pisteActuelle,
    enLecture,
    enMemoireTampon,
    enReconnexion,
    erreur,
    statut,
    qualiteAudio,
    minuteurSommeilMinutes,
    titreEnCours,
    etatServeur,
    lireDirect,
    mettreEnPause,
    reprendre,
    arreter,
    definirQualiteAudio,
    definirMinuteurSommeil,
  } = usePlayer();

  const [modalQualiteVisible, setModalQualiteVisible] = useState(false);
  const [modalMinuteurVisible, setModalMinuteurVisible] = useState(false);

  const estEnDirectActif = pisteActuelle?.type === "direct";
  const enTrainDeJouer = estEnDirectActif && enLecture;

  function basculer() {
    if (!estEnDirectActif) {
      lireDirect();
    } else if (enLecture) {
      mettreEnPause();
    } else {
      reprendre();
    }
  }

  return (
    <ScrollView
      style={styles.conteneur}
      contentContainerStyle={styles.contenu}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.entete}>
        <Image source={require("../../assets/logo-rndb.png")} style={styles.logo} resizeMode="contain" />
        <LiveBadge />
        <Text style={styles.nomStation}>{config.nomOfficiel}</Text>
        <Text style={styles.frequence}>{config.frequence}</Text>
      </View>

      <Image
        source={{ uri: emissionActuelle.visuelUrl }}
        style={styles.visuel}
      />

      <View style={styles.infosEmission}>
        <Text style={styles.titreEmission}>{emissionActuelle.titre}</Text>
        <Text style={styles.animateur}>{emissionActuelle.animateur}</Text>
        <Text style={styles.horaire}>
          {emissionActuelle.heureDebut} – {emissionActuelle.heureFin}
        </Text>
        {estEnDirectActif ? (
          <Text style={styles.titreEnCours} numberOfLines={2}>
            {titreEnCours}
          </Text>
        ) : null}
      </View>

      <View style={styles.zoneStatut}>
        {statut === "error" && estEnDirectActif ? (
          <View style={styles.zoneErreur}>
            <View style={styles.ligneStatutPoint}>
              <View style={[styles.pointStatut, { backgroundColor: colors.danger }]} />
              <Text style={styles.erreurTexte}>
                {erreur === "Le flux radio n'est pas encore configuré."
                  ? erreur
                  : "Le direct est temporairement indisponible."}
              </Text>
            </View>
            <TouchableOpacity style={styles.boutonReessayer} onPress={lireDirect}>
              <Text style={styles.boutonReessayerTexte}>{t("commun.reessayer")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ligneStatutPoint}>
            <View
              style={[
                styles.pointStatut,
                {
                  backgroundColor:
                    statut === "reconnecting" || statut === "loading"
                      ? colors.attente
                      : statut === "playing" && estEnDirectActif
                        ? colors.succes
                        : colors.texteSecondaire,
                },
              ]}
            />
            <Text style={styles.statutTexte}>
              {statut === "reconnecting"
                ? t("lecteur.reconnexion")
                : statut === "loading" && estEnDirectActif
                  ? t("lecteur.connexion")
                  : etatServeur && !etatServeur.enLigne
                    ? "Le serveur radio est momentanément indisponible."
                    : t("lecteur.enDirect24h")}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.rangeeBoutons}>
        <TouchableOpacity style={styles.boutonPrincipal} onPress={basculer} activeOpacity={0.85}>
          {enMemoireTampon || enReconnexion ? (
            <ActivityIndicator color={colors.fond} size="large" />
          ) : (
            <Ionicons
              name={enTrainDeJouer ? "pause" : "play"}
              size={44}
              color={colors.fond}
            />
          )}
        </TouchableOpacity>

        {estEnDirectActif ? (
          <TouchableOpacity
            style={styles.boutonArreter}
            onPress={arreter}
            activeOpacity={0.85}
            accessibilityLabel={t("lecteur.arreter")}
          >
            <Ionicons name="stop" size={26} color={colors.texteSecondaire} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.actionsSecondaires}>
        <TouchableOpacity
          style={styles.actionSecondaire}
          onPress={() => setModalQualiteVisible(true)}
        >
          <Ionicons name="wifi" size={18} color={colors.texteSecondaire} />
          <Text style={styles.actionSecondaireTexte}>{t("lecteur.qualite")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionSecondaire}
          onPress={() => setModalMinuteurVisible(true)}
        >
          <Ionicons name="moon" size={18} color={colors.texteSecondaire} />
          <Text style={styles.actionSecondaireTexte}>
            {minuteurSommeilMinutes
              ? t("lecteur.eteindreDans", { minutes: minuteurSommeilMinutes })
              : t("lecteur.minuteurSommeil")}
          </Text>
        </TouchableOpacity>
      </View>

      {RESEAUX_LIVE.some((r) => config[r.cle]) ? (
        <View style={styles.blocReseaux}>
          <Text style={styles.titreReseaux}>Suivez aussi le direct sur nos réseaux</Text>
          <View style={styles.ligneReseaux}>
            {RESEAUX_LIVE.filter((r) => config[r.cle]).map((r) => (
              <TouchableOpacity
                key={r.cle}
                style={styles.boutonReseau}
                onPress={() => ouvrirLien(config[r.cle]!)}
              >
                <Ionicons name={r.icone} size={22} color={colors.primaire} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      <ModalChoix
        visible={modalQualiteVisible}
        onFermer={() => setModalQualiteVisible(false)}
        titre={t("lecteur.qualite")}
        options={QUALITES.map((q) => ({
          cle: q,
          libelle: t(`lecteur.qualite${q === "eco" ? "Eco" : q === "haute" ? "Haute" : "Standard"}`),
          selectionne: q === qualiteAudio,
        }))}
        onSelectionner={(cle) => {
          definirQualiteAudio(cle as QualiteAudio);
          setModalQualiteVisible(false);
        }}
      />

      <ModalChoix
        visible={modalMinuteurVisible}
        onFermer={() => setModalMinuteurVisible(false)}
        titre={t("lecteur.minuteurSommeil")}
        options={[
          { cle: "aucun", libelle: t("lecteur.aucunMinuteur"), selectionne: minuteurSommeilMinutes === null },
          ...MINUTEURS.map((m) => ({
            cle: String(m),
            libelle: `${m} min`,
            selectionne: minuteurSommeilMinutes === m,
          })),
        ]}
        onSelectionner={(cle) => {
          definirMinuteurSommeil(cle === "aucun" ? null : Number(cle));
          setModalMinuteurVisible(false);
        }}
      />
    </ScrollView>
  );
}

function ModalChoix({
  visible,
  onFermer,
  titre,
  options,
  onSelectionner,
}: {
  visible: boolean;
  onFermer: () => void;
  titre: string;
  options: { cle: string; libelle: string; selectionne: boolean }[];
  onSelectionner: (cle: string) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onFermer}>
      <Pressable style={styles.modalFond} onPress={onFermer}>
        <View style={styles.modalContenu}>
          <Text style={styles.modalTitre}>{titre}</Text>
          {options.map((option) => (
            <TouchableOpacity
              key={option.cle}
              style={styles.modalOption}
              onPress={() => onSelectionner(option.cle)}
            >
              <Text style={styles.modalOptionTexte}>{option.libelle}</Text>
              {option.selectionne ? (
                <Ionicons name="checkmark" size={18} color={colors.primaire} />
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  contenu: { alignItems: "center", paddingTop: 60, paddingBottom: 140 },
  entete: { alignItems: "center", gap: 10, marginBottom: espacement.lg },
  logo: { width: 96, height: 96, marginBottom: 4 },
  nomStation: { color: colors.texteSecondaire, fontSize: 12, fontWeight: "600", letterSpacing: 1 },
  frequence: { color: colors.primaire, fontSize: 16, fontWeight: "800" },
  visuel: { width: 260, height: 260, borderRadius: rayon.lg, backgroundColor: colors.carte },
  infosEmission: { alignItems: "center", marginTop: espacement.lg },
  titreEmission: { color: colors.texte, fontSize: 22, fontWeight: "700" },
  animateur: { color: colors.texteSecondaire, fontSize: 14, marginTop: 4 },
  horaire: { color: colors.primaire, fontSize: 13, marginTop: 6 },
  titreEnCours: {
    color: colors.primaire,
    fontSize: 13,
    marginTop: espacement.sm,
    textAlign: "center",
    paddingHorizontal: espacement.lg,
  },
  zoneStatut: { marginTop: espacement.lg, minHeight: 20, alignItems: "center" },
  ligneStatutPoint: { flexDirection: "row", alignItems: "center", gap: 7 },
  pointStatut: { width: 7, height: 7, borderRadius: 4 },
  statutTexte: { color: colors.texteSecondaire, fontSize: 13 },
  zoneErreur: { alignItems: "center", gap: espacement.sm },
  erreurTexte: { color: colors.danger, fontSize: 13, textAlign: "center" },
  boutonReessayer: {
    backgroundColor: colors.carte,
    borderRadius: rayon.rond,
    paddingHorizontal: espacement.lg,
    paddingVertical: 8,
  },
  boutonReessayerTexte: { color: colors.primaire, fontSize: 12, fontWeight: "700" },
  rangeeBoutons: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.lg,
    marginTop: espacement.md,
  },
  boutonPrincipal: {
    width: 84,
    height: 84,
    borderRadius: rayon.rond,
    backgroundColor: colors.primaire,
    alignItems: "center",
    justifyContent: "center",
  },
  boutonArreter: {
    width: 48,
    height: 48,
    borderRadius: rayon.rond,
    backgroundColor: colors.carte,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsSecondaires: {
    flexDirection: "row",
    gap: espacement.lg,
    marginTop: espacement.xl,
  },
  actionSecondaire: { alignItems: "center", gap: 6 },
  actionSecondaireTexte: { color: colors.texteSecondaire, fontSize: 11 },
  blocReseaux: { alignItems: "center", marginTop: espacement.xl },
  titreReseaux: { color: colors.texteSecondaire, fontSize: 12, marginBottom: espacement.sm },
  ligneReseaux: { flexDirection: "row", gap: espacement.md },
  boutonReseau: {
    width: 42,
    height: 42,
    borderRadius: rayon.rond,
    backgroundColor: colors.carte,
    alignItems: "center",
    justifyContent: "center",
  },
  modalFond: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContenu: {
    backgroundColor: colors.carte,
    borderTopLeftRadius: rayon.lg,
    borderTopRightRadius: rayon.lg,
    padding: espacement.lg,
  },
  modalTitre: { color: colors.texte, fontSize: 16, fontWeight: "700", marginBottom: espacement.md },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separateur,
  },
  modalOptionTexte: { color: colors.texte, fontSize: 15 },
});
