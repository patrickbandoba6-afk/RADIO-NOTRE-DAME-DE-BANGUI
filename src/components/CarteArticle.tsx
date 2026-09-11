import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formaterDateRelative } from "@/lib/format";
import { colors, espacement, rayon } from "@/theme/colors";
import type { Article } from "@/types/editorial";

/** Grande carte immersive utilisée pour « À la une ». */
export function CarteArticleUne({
  article,
  onPress,
  largeur = 280,
}: {
  article: Article;
  onPress: () => void;
  largeur?: number;
}) {
  return (
    <TouchableOpacity
      style={[stylesUne.conteneur, { width: largeur }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image source={{ uri: article.imageUrl }} style={stylesUne.image} />
      <LinearGradient
        colors={["transparent", "rgba(11,31,58,0.95)"]}
        style={stylesUne.voile}
      />
      <View style={stylesUne.contenu}>
        <View style={stylesUne.puce}>
          <Text style={stylesUne.puceTexte}>{article.categorie || "Actualité"}</Text>
        </View>
        <Text style={stylesUne.titre} numberOfLines={3}>
          {article.titre}
        </Text>
        <Text style={stylesUne.date}>{formaterDateRelative(article.datePublication)}</Text>
      </View>
    </TouchableOpacity>
  );
}

/** Ligne compacte pour les listes d'actualités. */
export function CarteArticleLigne({
  article,
  onPress,
}: {
  article: Article;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={stylesLigne.conteneur} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: article.imageUrl }} style={stylesLigne.image} />
      <View style={stylesLigne.textes}>
        {article.urgent ? (
          <Text style={stylesLigne.urgent}>● URGENT</Text>
        ) : (
          <Text style={stylesLigne.categorie} numberOfLines={1}>
            {article.categorie || "Actualité"}
          </Text>
        )}
        <Text style={stylesLigne.titre} numberOfLines={3}>
          {article.titre}
        </Text>
        <Text style={stylesLigne.date}>{formaterDateRelative(article.datePublication)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const stylesUne = StyleSheet.create({
  conteneur: {
    height: 200,
    borderRadius: rayon.lg,
    overflow: "hidden",
    marginRight: espacement.md,
    backgroundColor: colors.carte,
  },
  image: { position: "absolute", inset: 0, width: "100%", height: "100%" },
  voile: { position: "absolute", left: 0, right: 0, bottom: 0, top: "35%" },
  contenu: { position: "absolute", left: 0, right: 0, bottom: 0, padding: espacement.sm },
  puce: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaire,
    borderRadius: rayon.rond,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  puceTexte: { color: colors.fond, fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  titre: { color: colors.blanc, fontSize: 15, fontWeight: "800", lineHeight: 20 },
  date: { color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 4 },
});

const stylesLigne = StyleSheet.create({
  conteneur: {
    flexDirection: "row",
    gap: espacement.sm,
    paddingVertical: espacement.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separateur,
  },
  image: { width: 104, height: 84, borderRadius: rayon.md, backgroundColor: colors.carte },
  textes: { flex: 1, justifyContent: "center" },
  categorie: {
    color: colors.primaire,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  urgent: { color: colors.danger, fontSize: 10, fontWeight: "800" },
  titre: { color: colors.texte, fontSize: 14, fontWeight: "700", marginTop: 3, lineHeight: 19 },
  date: { color: colors.texteSecondaire, fontSize: 11, marginTop: 4 },
});
