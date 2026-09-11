import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { AgendaScreen } from "@/screens/agenda/AgendaScreen";
import { AnnoncesScreen } from "@/screens/agenda/AnnoncesScreen";
import { DetailAnnonceScreen } from "@/screens/agenda/DetailAnnonceScreen";
import { DetailEvenementScreen } from "@/screens/home/DetailEvenementScreen";
import { ParoissesScreen } from "@/screens/menu/ParoissesScreen";
import { optionsEcran } from "./optionsEcran";
import type { PileAgenda } from "./types";

const Stack = createNativeStackNavigator<PileAgenda>();

export function AgendaStack() {
  return (
    <Stack.Navigator screenOptions={optionsEcran}>
      <Stack.Screen name="Agenda" component={AgendaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Annonces" component={AnnoncesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DetailAnnonce" component={DetailAnnonceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DetailEvenement" component={DetailEvenementScreen} options={{ title: "" }} />
      <Stack.Screen name="Paroisses" component={ParoissesScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
