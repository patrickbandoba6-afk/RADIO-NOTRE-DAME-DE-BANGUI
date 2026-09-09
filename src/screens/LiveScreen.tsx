import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LiveBadge } from "@/components/LiveBadge";
import { usePlayer } from "@/context/PlayerContext";
import { emissionActuelle, emissionSuivante } from "@/data/sampleData";
import { colors, espacement, rayon } from "@/theme/colors";
import type { QualiteAudio } from "@/types";

const MINUTEURS = [15, 30, 45, 60];
const QUALITES: QualiteAudio[] = ["eco", "standard", "haute"];

export function LiveScreen() {
  const { t } = useTranslation();
  const {
    pisteActuelle,
    enLecture,
    enMemoireTampon,
    enReconnexion,
    estDirect,
    qualiteAudio,
    minuteurSommeilMinutes,
    lireDirect,
    mettreEnPause,
    reprendre,
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
    <View style={styles.conteneur}>
      <View style={styles.entete}>
        <LiveBadge />
        <Text style={styles.nomStation}>RADIO NOTRE DAME DE BANGUI</Text>
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
      </View>

      <View style={styles.zoneStatut}>
        {enReconnexion ? (
          <Text style={styles.statutTexte}>{t("lecteur.reconnexion")}</Text>
        ) : enMemoireTampon && estEnDirectActif ? (
          <Text style={styles.statutTexte}>{t("lecteur.connexion")}</Text>
        ) : (
          <Text style={styles.statutTexte}>{t("lecteur.enDirect24h")}</Text>
        )}
      </View>

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
    </View>
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
  conteneur: { flex: 1, backgroundColor: colors.fond, alignItems: "center", paddingTop: 60 },
  entete: { alignItems: "center", gap: 10, marginBottom: espacement.lg },
  nomStation: { color: colors.texteSecondaire, fontSize: 12, fontWeight: "600", letterSpacing: 1 },
  visuel: { width: 260, height: 260, borderRadius: rayon.lg, backgroundColor: colors.carte },
  infosEmission: { alignItems: "center", marginTop: espacement.lg },
  titreEmission: { color: colors.texte, fontSize: 22, fontWeight: "700" },
  animateur: { color: colors.texteSecondaire, fontSize: 14, marginTop: 4 },
  horaire: { color: colors.primaire, fontSize: 13, marginTop: 6 },
  zoneStatut: { marginTop: espacement.lg, minHeight: 20 },
  statutTexte: { color: colors.texteSecondaire, fontSize: 13 },
  boutonPrincipal: {
    width: 84,
    height: 84,
    borderRadius: rayon.rond,
    backgroundColor: colors.primaire,
    alignItems: "center",
    justifyContent: "center",
    marginTop: espacement.md,
  },
  actionsSecondaires: {
    flexDirection: "row",
    gap: espacement.lg,
    marginTop: espacement.xl,
  },
  actionSecondaire: { alignItems: "center", gap: 6 },
  actionSecondaireTexte: { color: colors.texteSecondaire, fontSize: 11 },
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
