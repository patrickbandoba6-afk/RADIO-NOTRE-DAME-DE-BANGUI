import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EtatChargement } from "@/components/EtatsEcran";
import { useFavoris } from "@/context/FavorisContext";
import { useHistorique } from "@/context/HistoriqueContext";
import { useContenu } from "@/hooks/useContenu";
import { formaterDate, ouvrirLien, partagerContenu } from "@/lib/format";
import { chargerArticleParId, incrementerVues } from "@/lib/repository";
import { colors, espacement, rayon } from "@/theme/colors";
import type { Article } from "@/types/editorial";

export function ArticleScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const id: string = route.params.id;
  const { estFavori, basculerFavori } = useFavoris();
  const { enregistrerConsultation } = useHistorique();

  const { donnees: article, chargement } = useContenu<Article | null>(
    () => chargerArticleParId(id),
    null,
    [id]
  );

  useEffect(() => {
    if (!article) return;
    enregistrerConsultation({
      id: article.id,
      type: "article",
      titre: article.titre,
      imageUrl: article.imageUrl,
      consulteLeISO: new Date().toISOString(),
    });
    incrementerVues(article.id);
  }, [article, enregistrerConsultation]);

  if (chargement) return <EtatChargement />;
  if (!article) return null;

  const favori = estFavori("article", article.id);

  return (
    <ScrollView style={styles.conteneur} contentContainerStyle={{ paddingBottom: 150 }}>
      <View>
        <Image source={{ uri: article.imageUrl }} style={styles.image} />
        <TouchableOpacity style={styles.boutonRetour} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.texte} />
        </TouchableOpacity>
      </View>

      <View style={styles.contenu}>
        <View style={styles.ligneMeta}>
          <View style={styles.puceCategorie}>
            <Text style={styles.puceTexte}>{article.categorie || "Actualité"}</Text>
          </View>
          {article.urgent ? <Text style={styles.urgent}>● URGENT</Text> : null}
        </View>

        <Text style={styles.titre}>{article.titre}</Text>
        {article.sousTitre ? <Text style={styles.sousTitre}>{article.sousTitre}</Text> : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.action}
            onPress={() => basculerFavori("article", article.id)}
          >
            <Ionicons
              name={favori ? "heart" : "heart-outline"}
              size={20}
              color={colors.primaire}
            />
            <Text style={styles.actionTexte}>Favori</Text>
          </TouchableOpacity>
          {article.partageAutorise ? (
            <TouchableOpacity
              style={styles.action}
              onPress={() => partagerContenu(article.titre, article.resume)}
            >
              <Ionicons name="share-social-outline" size={20} color={colors.primaire} />
              <Text style={styles.actionTexte}>Partager</Text>
            </TouchableOpacity>
          ) : null}
          {article.audioUrl ? (
            <TouchableOpacity style={styles.action} onPress={() => ouvrirLien(article.audioUrl!)}>
              <Ionicons name="headset-outline" size={20} color={colors.primaire} />
              <Text style={styles.actionTexte}>Écouter</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {article.resume ? <Text style={styles.resume}>{article.resume}</Text> : null}

        {article.contenu.split("\n\n").map((paragraphe, index) => (
          <Text key={index} style={styles.paragraphe}>
            {paragraphe}
          </Text>
        ))}

        {article.tags.length > 0 ? (
          <View style={styles.tags}>
            {article.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagTexte}>#{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.signature}>
          {article.auteur} · {formaterDate(article.datePublication)}
          {article.lieu ? ` · ${article.lieu}` : ""}
        </Text>

        {article.source ? (
          <TouchableOpacity
            onPress={() => article.sourceUrl && ouvrirLien(article.sourceUrl)}
            disabled={!article.sourceUrl}
          >
            <Text style={styles.source}>Source : {article.source}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: colors.fond },
  image: { width: "100%", height: 260, backgroundColor: colors.carte },
  boutonRetour: {
    position: "absolute",
    top: 48,
    left: espacement.md,
    width: 38,
    height: 38,
    borderRadius: rayon.rond,
    backgroundColor: "rgba(11,31,58,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  contenu: { padding: espacement.md },
  ligneMeta: { flexDirection: "row", alignItems: "center", gap: espacement.sm },
  puceCategorie: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  puceTexte: { color: colors.fond, fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  urgent: { color: colors.danger, fontSize: 11, fontWeight: "800" },
  titre: { color: colors.texte, fontSize: 24, fontWeight: "800", marginTop: espacement.sm, lineHeight: 31 },
  sousTitre: { color: colors.texteSecondaire, fontSize: 15, marginTop: 6, lineHeight: 21 },
  actions: {
    flexDirection: "row",
    gap: espacement.lg,
    marginTop: espacement.md,
    paddingVertical: espacement.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separateur,
  },
  action: { alignItems: "center", gap: 3 },
  actionTexte: { color: colors.texteSecondaire, fontSize: 10 },
  resume: {
    color: colors.texte,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginTop: espacement.md,
  },
  paragraphe: { color: colors.texte, fontSize: 15, lineHeight: 24, marginTop: espacement.md },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: espacement.lg },
  tag: {
    backgroundColor: colors.carte,
    borderRadius: rayon.rond,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagTexte: { color: colors.accent, fontSize: 11, fontWeight: "600" },
  signature: { color: colors.texteSecondaire, fontSize: 12, marginTop: espacement.lg },
  source: { color: colors.accent, fontSize: 12, marginTop: 6 },
});
