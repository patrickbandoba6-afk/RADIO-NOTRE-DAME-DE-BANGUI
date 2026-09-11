import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActualitesScreen } from "@/screens/actualites/ActualitesScreen";
import { ArticleScreen } from "@/screens/actualites/ArticleScreen";
import { CommuniquesScreen } from "@/screens/menu/CommuniquesScreen";
import { DossiersScreen } from "@/screens/menu/DossiersScreen";
import { optionsEcran } from "./optionsEcran";
import type { PileActualites } from "./types";

const Stack = createNativeStackNavigator<PileActualites>();

export function ActualitesStack() {
  return (
    <Stack.Navigator screenOptions={optionsEcran}>
      <Stack.Screen name="Actualites" component={ActualitesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Article" component={ArticleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Dossiers" component={DossiersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Communiques" component={CommuniquesScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
