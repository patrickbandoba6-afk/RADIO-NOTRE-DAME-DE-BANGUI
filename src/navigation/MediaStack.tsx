import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { DetailEmissionScreen } from "@/screens/media/DetailEmissionScreen";
import { DetailPodcastScreen } from "@/screens/media/DetailPodcastScreen";
import { DetailPredicationScreen } from "@/screens/media/DetailPredicationScreen";
import { EmissionsScreen } from "@/screens/media/EmissionsScreen";
import { GrilleScreen } from "@/screens/media/GrilleScreen";
import { LecteurVideoScreen } from "@/screens/media/LecteurVideoScreen";
import { PodcastsScreen } from "@/screens/media/PodcastsScreen";
import { PredicationsScreen } from "@/screens/media/PredicationsScreen";
import { VideosScreen } from "@/screens/media/VideosScreen";
import { optionsEcran } from "./optionsEcran";
import type { PilePodcasts } from "./types";

const Stack = createNativeStackNavigator<PilePodcasts>();

/** Pile de l'onglet Podcasts : podcasts, émissions, prédications et vidéos. */
export function MediaStack() {
  return (
    <Stack.Navigator screenOptions={optionsEcran}>
      <Stack.Screen name="Podcasts" component={PodcastsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Emissions" component={EmissionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DetailEmission" component={DetailEmissionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DetailPodcast" component={DetailPodcastScreen} options={{ title: "" }} />
      <Stack.Screen name="Predications" component={PredicationsScreen} options={{ title: "Prédications" }} />
      <Stack.Screen name="DetailPredication" component={DetailPredicationScreen} options={{ title: "" }} />
      <Stack.Screen name="Videos" component={VideosScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LecteurVideo" component={LecteurVideoScreen} options={{ title: "" }} />
      <Stack.Screen name="Grille" component={GrilleScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
