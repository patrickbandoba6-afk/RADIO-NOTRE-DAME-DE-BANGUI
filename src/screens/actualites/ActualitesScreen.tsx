import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { CarteArticleLigne, CarteArticleUne } from "@/components/CarteArticle";
import { EcranConteneur } from "@/components/EcranConteneur";
import { EtatChargement, EtatVide } from "@/components/EtatsEcran";
import { FiltresPuces, type OptionFiltre } from "@/components/FiltresPuces";
import { useContenu } from "@/hooks/useContenu";
import { chargerArticles } from "@/lib/repository";
import { colors, espacement } from "@/theme/colors";
import type { Article, Rubrique } from "@/types/editorial";

const RUBRIQUES: OptionFiltre[] = [
  { cle: "actualites", libelle: "Toute l'actu" },
  { cle: "bangui", libelle: "À Bangui" },
  { cle: "rca", libelle: "En RCA" },
  { cle: "afrique", libelle: "En Afrique" },
  { cle: "monde", libelle: "Dans le monde" },
  { cle: "vie_eglise", libelle: "Vie de l'Église" },
  { cle: "jeunesse", libelle: "Jeunesse" },
  { cle: "famille", libelle: "Famille" },
  { cle: "solidarite", libelle: "Solidarité" },
  { cle: "culture", libelle: "Culture" },
];

export function ActualitesScreen() {
  const navigation = useNavigation<any>();
  const [rubrique, setRubrique] = useState<Rubrique>("actualites");

  const { donnees, chargement, recharger } = useContenu<Article[]>(
    () => chargerArticles(rubrique),
    [],
    [rubrique]
  );

  const { une, reste } = useMemo(() => {
    const aLaUne = donnees.filter((a) => a.aLaUne);
    const autres = donnees.filter((a) => !a.aLaUne);
    return { une: aLaUne, reste: autres.length > 0 ? autres : donnees };
  }, [donnees]);

  function ouvrir(article: Article) {
    navigation.navigate("Article", { id: article.id });
  }

  return (
    <EcranConteneur defilable={false}>
      <Text style={styles.titrePage}>Actualités</Text>
      <FiltresPuces
        options={RUBRIQUES}
        actif={rubrique}
        onChanger={(cle) => setRubrique(cle as Rubrique)}
      />

      {chargement ? (
        <EtatChargement />
      ) : donnees.length === 0 ? (
        <EtatVide
          icone="newspaper-outline"
          titre="Aucune actualité"
          description="Aucun article publié dans cette rubrique pour le moment."
        />
      ) : (
        <FlatList
          data={reste}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.liste}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={recharger} tintColor={colors.primaire} />
          }
          ListHeaderComponent={
            une.length > 0 ? (
              <View style={styles.enteteUne}>
                <Text style={styles.titreSection}>À la une</Text>
                <FlatList
                  horizontal
                  data={une}
                  keyExtractor={(item) => `une-${item.id}`}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <CarteArticleUne article={item} onPress={() => ouvrir(item)} />
                  )}
                />
                <Text style={[styles.titreSection, { marginTop: espacement.lg }]}>
                  Dernières actualités
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <CarteArticleLigne article={item} onPress={() => ouvrir(item)} />
          )}
        />
      )}
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
  },
  liste: { paddingHorizontal: espacement.md, paddingBottom: 150 },
  enteteUne: { marginBottom: espacement.sm },
  titreSection: { color: colors.texte, fontSize: 18, fontWeight: "700", marginBottom: espacement.sm },
});
