import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EcranConteneur } from "@/components/EcranConteneur";
import { EtatChargement, EtatVide } from "@/components/EtatsEcran";
import { usePlayer } from "@/context/PlayerContext";
import { useContenu } from "@/hooks/useContenu";
import { formaterDuree, partagerContenu } from "@/lib/format";
import { chargerPrieres } from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { Priere, TypePriere } from "@/types/editorial";

const LARGEUR_CARTE = Math.min(Dimensions.get("window").width - 80, 300);

const FAMILLES: { cle: TypePriere[]; titre: string }[] = [
  { cle: ["matin", "soir", "quotidienne"], titre: "Prier chaque jour" },
  { cle: ["chapelet", "mariale", "neuvaine", "adoration"], titre: "Prières traditionnelles" },
  { cle: ["paix", "malades", "familles", "jeunes", "defunts"], titre: "Prier pour…" },
];

export function PrieresScreen() {
  const { pisteActuelle, enLecture, lirePiste, mettreEnPause, reprendre } = usePlayer();
  const { donnees, chargement } = useContenu<Priere[]>(chargerPrieres, []);
  const [priereOuverte, setPriereOuverte] = useState<Priere | null>(null);

  const misesEnAvant = useMemo(
    () => donnees.filter((p) => ["matin", "soir", "quotidienne"].includes(p.type)),
    [donnees]
  );

  function ecouter(priere: Priere) {
    if (!priere.audioUrl) {
      setPriereOuverte(priere);
      return;
    }
    if (pisteActuelle?.id === priere.id) {
      enLecture ? mettreEnPause() : reprendre();
      return;
    }
    lirePiste({
      type: "predication",
      id: priere.id,
      titre: priere.titre,
      sousTitre: "Prière",
      imageUrl: priere.imageUrl,
      audioUrl: priere.audioUrl,
    });
  }

  if (chargement) return <EtatChargement />;
  if (donnees.length === 0) {
    return <EtatVide icone="heart-outline" titre="Aucune prière publiée" />;
  }

  return (
    <EcranConteneur defilable={false}>
      <Text style={styles.titrePage}>Prière</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={LARGEUR_CARTE + espacement.md}
          decelerationRate="fast"
          contentContainerStyle={styles.carrousel}
        >
          {misesEnAvant.map((priere) => (
            <View key={priere.id} style={[styles.carteHero, { width: LARGEUR_CARTE }]}>
              <Image source={{ uri: priere.imageUrl }} style={styles.imageHero} />
              <LinearGradient
                colors={["transparent", "rgba(11,31,58,0.9)"]}
                style={styles.voile}
              />
              <View style={styles.contenuHero}>
                <Text style={styles.titreHero} numberOfLines={2}>
                  {priere.titre}
                </Text>
                <TouchableOpacity style={styles.boutonPrier} onPress={() => ecouter(priere)}>
                  <Ionicons
                    name={pisteActuelle?.id === priere.id && enLecture ? "pause" : "play"}
                    size={16}
                    color={colors.fond}
                  />
                  <Text style={styles.boutonPrierTexte}>Prier</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {FAMILLES.map((famille) => {
          const prieres = donnees.filter((p) => famille.cle.includes(p.type));
          if (prieres.length === 0) return null;
          return (
            <View key={famille.titre}>
              <Text style={styles.titreSection}>{famille.titre}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listeHorizontale}
              >
                {prieres.map((priere) => (
                  <TouchableOpacity
                    key={priere.id}
                    style={styles.vignette}
                    activeOpacity={0.85}
                    onPress={() => setPriereOuverte(priere)}
                  >
                    <Image source={{ uri: priere.imageUrl }} style={styles.imageVignette} />
                    <LinearGradient
                      colors={["transparent", "rgba(11,31,58,0.85)"]}
                      style={styles.voileVignette}
                    />
                    <Text style={styles.titreVignette} numberOfLines={2}>
                      {priere.titre}
                    </Text>
                    {priere.dureeSecondes ? (
                      <Text style={styles.dureeVignette}>
                        {formaterDuree(priere.dureeSecondes)}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={priereOuverte !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setPriereOuverte(null)}
      >
        <Pressable style={styles.modalFond} onPress={() => setPriereOuverte(null)}>
          <Pressable style={styles.modalContenu} onPress={(e) => e.stopPropagation()}>
            {priereOuverte ? (
              <ScrollView>
                <Text style={styles.modalTitre}>{priereOuverte.titre}</Text>
                <Text style={styles.modalTexte}>{priereOuverte.texte}</Text>
                {priereOuverte.auteur ? (
                  <Text style={styles.modalAuteur}>{priereOuverte.auteur}</Text>
                ) : null}
                <View style={styles.modalActions}>
                  {priereOuverte.audioUrl ? (
                    <TouchableOpacity
                      style={styles.boutonPrier}
                      onPress={() => ecouter(priereOuverte)}
                    >
                      <Ionicons name="play" size={16} color={colors.fond} />
                      <Text style={styles.boutonPrierTexte}>Écouter</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={styles.boutonPartage}
                    onPress={() => partagerContenu(priereOuverte.titre, priereOuverte.texte)}
                  >
                    <Ionicons name="share-social-outline" size={16} color={colors.primaire} />
                    <Text style={styles.boutonPartageTexte}>Partager</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </EcranConteneur>
  );
}

const styles = StyleSheet.create({
  titrePage: {
    color: colors.texte,
    fontSize: 24,
    fontWeight: "800",
    paddingHorizontal: espacement.md,
    paddingTop: espacement.sm,
    paddingBottom: espacement.sm,
  },
  carrousel: { paddingHorizontal: espacement.md, gap: espacement.md },
  carteHero: {
    height: 260,
    borderRadius: rayon.lg,
    overflow: "hidden",
    backgroundColor: colors.carte,
  },
  imageHero: { width: "100%", height: "100%" },
  voile: { position: "absolute", left: 0, right: 0, bottom: 0, top: "40%" },
  contenuHero: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: espacement.md,
    alignItems: "center",
    gap: espacement.sm,
  },
  titreHero: { color: colors.blanc, fontSize: 20, fontWeight: "800", textAlign: "center" },
  boutonPrier: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingHorizontal: espacement.xl,
    paddingVertical: 11,
  },
  boutonPrierTexte: { color: colors.fond, fontWeight: "800" },
  titreSection: {
    color: colors.texte,
    fontSize: 17,
    fontWeight: "700",
    paddingHorizontal: espacement.md,
    marginTop: espacement.lg,
    marginBottom: espacement.sm,
  },
  listeHorizontale: { paddingHorizontal: espacement.md, gap: espacement.sm },
  vignette: {
    width: 150,
    height: 110,
    borderRadius: rayon.md,
    overflow: "hidden",
    backgroundColor: colors.carte,
    justifyContent: "flex-end",
    padding: espacement.sm,
  },
  imageVignette: { position: "absolute", inset: 0, width: "100%", height: "100%" },
  voileVignette: { position: "absolute", left: 0, right: 0, bottom: 0, top: "30%" },
  titreVignette: { color: colors.blanc, fontSize: 13, fontWeight: "800" },
  dureeVignette: { color: "rgba(255,255,255,0.8)", fontSize: 10, marginTop: 2 },
  modalFond: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalContenu: {
    backgroundColor: colors.carte,
    borderTopLeftRadius: rayon.lg,
    borderTopRightRadius: rayon.lg,
    padding: espacement.lg,
    maxHeight: "80%",
  },
  modalTitre: { color: colors.texte, fontSize: 20, fontWeight: "800" },
  modalTexte: {
    color: colors.texte,
    fontSize: 16,
    lineHeight: 26,
    marginTop: espacement.md,
    fontStyle: "italic",
  },
  modalAuteur: { color: colors.texteSecondaire, fontSize: 12, marginTop: espacement.md },
  modalActions: { flexDirection: "row", gap: espacement.sm, marginTop: espacement.lg },
  boutonPartage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.fondClair,
    borderRadius: rayon.rond,
    paddingHorizontal: espacement.lg,
    paddingVertical: 11,
  },
  boutonPartageTexte: { color: colors.primaire, fontWeight: "700" },
});
