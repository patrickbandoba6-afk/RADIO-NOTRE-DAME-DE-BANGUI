import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { HomeScreen } from "@/screens/HomeScreen";
import { DonsScreen } from "@/screens/compte/DonsScreen";
import { CommunauteScreen } from "@/screens/home/CommunauteScreen";
import { DetailEvenementScreen } from "@/screens/home/DetailEvenementScreen";
import { EvenementsScreen } from "@/screens/home/EvenementsScreen";
import { NotificationsScreen } from "@/screens/home/NotificationsScreen";
import { RechercheScreen } from "@/screens/home/RechercheScreen";
import { GrilleScreen } from "@/screens/media/GrilleScreen";
import { EvangileScreen } from "@/screens/prier/EvangileScreen";
import { optionsEcran } from "./optionsEcran";
import type { PileAccueil } from "./types";

const Stack = createNativeStackNavigator<PileAccueil>();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={optionsEcran}>
      <Stack.Screen name="Accueil" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Recherche" component={RechercheScreen} options={{ title: "Recherche" }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Notifications" }} />
      <Stack.Screen name="Evangile" component={EvangileScreen} options={{ title: "" }} />
      <Stack.Screen name="Grille" component={GrilleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Dons" component={DonsScreen} options={{ title: "Soutenir la radio" }} />
      <Stack.Screen name="Communaute" component={CommunauteScreen} options={{ title: "Communauté" }} />
      <Stack.Screen name="Evenements" component={EvenementsScreen} options={{ title: "Événements" }} />
      <Stack.Screen name="DetailEvenement" component={DetailEvenementScreen} options={{ title: "" }} />
    </Stack.Navigator>
  );
}
