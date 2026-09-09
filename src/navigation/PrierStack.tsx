import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { useTranslation } from "react-i18next";
import { BibleScreen } from "@/screens/prier/BibleScreen";
import { NouveauTemoignageScreen } from "@/screens/prier/NouveauTemoignageScreen";
import { NouvelleDemandePriereScreen } from "@/screens/prier/NouvelleDemandePriereScreen";
import { PrierAccueilScreen } from "@/screens/prier/PrierAccueilScreen";
import { PriereScreen } from "@/screens/prier/PriereScreen";
import { TemoignagesScreen } from "@/screens/prier/TemoignagesScreen";
import { colors } from "@/theme/colors";
import type { PilePrier } from "./types";

const Stack = createNativeStackNavigator<PilePrier>();

export function PrierStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={optionsEcran}>
      <Stack.Screen name="PrierAccueil" component={PrierAccueilScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Bible" component={BibleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Priere" component={PriereScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="NouvelleDemandePriere"
        component={NouvelleDemandePriereScreen}
        options={{ title: t("priere.nouvelleDemande") }}
      />
      <Stack.Screen name="Temoignages" component={TemoignagesScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="NouveauTemoignage"
        component={NouveauTemoignageScreen}
        options={{ title: t("temoignages.partagerTemoignage") }}
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
