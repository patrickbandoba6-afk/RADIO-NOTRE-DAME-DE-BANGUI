import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { useTranslation } from "react-i18next";
import { DetailPodcastScreen } from "@/screens/media/DetailPodcastScreen";
import { DetailPredicationScreen } from "@/screens/media/DetailPredicationScreen";
import { LecteurVideoScreen } from "@/screens/media/LecteurVideoScreen";
import { MediaAccueilScreen } from "@/screens/media/MediaAccueilScreen";
import { PodcastsScreen } from "@/screens/media/PodcastsScreen";
import { PredicationsScreen } from "@/screens/media/PredicationsScreen";
import { VideosScreen } from "@/screens/media/VideosScreen";
import { colors } from "@/theme/colors";
import type { PileMedia } from "./types";

const Stack = createNativeStackNavigator<PileMedia>();

export function MediaStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={optionsEcran}>
      <Stack.Screen name="MediaAccueil" component={MediaAccueilScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Podcasts" component={PodcastsScreen} options={{ title: t("podcasts.titre") }} />
      <Stack.Screen name="DetailPodcast" component={DetailPodcastScreen} options={{ title: "" }} />
      <Stack.Screen name="Predications" component={PredicationsScreen} options={{ title: t("predications.titre") }} />
      <Stack.Screen name="DetailPredication" component={DetailPredicationScreen} options={{ title: "" }} />
      <Stack.Screen name="Videos" component={VideosScreen} options={{ title: t("video.titre") }} />
      <Stack.Screen name="LecteurVideo" component={LecteurVideoScreen} options={{ title: "" }} />
    </Stack.Navigator>
  );
}

const optionsEcran = {
  headerStyle: { backgroundColor: colors.fond },
  headerTintColor: colors.texte,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.fond },
};
