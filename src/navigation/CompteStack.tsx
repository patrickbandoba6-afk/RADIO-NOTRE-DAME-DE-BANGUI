import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { useTranslation } from "react-i18next";
import { CompteScreen } from "@/screens/compte/CompteScreen";
import { ConnexionScreen } from "@/screens/compte/ConnexionScreen";
import { DonsScreen } from "@/screens/compte/DonsScreen";
import { FavorisScreen } from "@/screens/compte/FavorisScreen";
import { ParametresScreen } from "@/screens/compte/ParametresScreen";
import { TelechargementsScreen } from "@/screens/compte/TelechargementsScreen";
import { colors } from "@/theme/colors";
import type { PileCompte } from "./types";

const Stack = createNativeStackNavigator<PileCompte>();

export function CompteStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={optionsEcran}>
      <Stack.Screen name="Compte" component={CompteScreen} options={{ title: t("compte.titre") }} />
      <Stack.Screen name="Connexion" component={ConnexionScreen} options={{ title: "" }} />
      <Stack.Screen name="Parametres" component={ParametresScreen} options={{ title: t("parametres.titre") }} />
      <Stack.Screen name="Dons" component={DonsScreen} options={{ title: t("dons.titre") }} />
      <Stack.Screen name="Favoris" component={FavorisScreen} options={{ title: t("compte.mesFavoris") }} />
      <Stack.Screen
        name="Telechargements"
        component={TelechargementsScreen}
        options={{ title: t("compte.mesTelechargements") }}
      />
    </Stack.Navigator>
  );
}

const optionsEcran = {
  headerStyle: { backgroundColor: colors.fond },
  headerTintColor: colors.texte,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.fond },
};
