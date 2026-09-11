import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ConnexionScreen } from "@/screens/compte/ConnexionScreen";
import { ChoixDepartScreen } from "@/screens/lancement/ChoixDepartScreen";
import { InscriptionScreen } from "@/screens/lancement/InscriptionScreen";
import { IntroScreen } from "@/screens/lancement/IntroScreen";
import { colors } from "@/theme/colors";
import { MainTabs } from "./MainTabs";
import type { PileLancement } from "./types";

const themeApp = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.fond,
    card: colors.carte,
    text: colors.texte,
    primary: colors.primaire,
    border: colors.separateur,
  },
};

const Stack = createNativeStackNavigator<PileLancement>();

export function RootNavigator() {
  return (
    <NavigationContainer theme={themeApp}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Choix" component={ChoixDepartScreen} />
        <Stack.Screen name="Inscription" component={InscriptionScreen} />
        <Stack.Screen name="Connexion" component={ConnexionScreen} />
        <Stack.Screen name="App" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
