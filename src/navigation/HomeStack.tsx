import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { useTranslation } from "react-i18next";
import { CommunauteScreen } from "@/screens/home/CommunauteScreen";
import { DetailEvenementScreen } from "@/screens/home/DetailEvenementScreen";
import { EvenementsScreen } from "@/screens/home/EvenementsScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { NotificationsScreen } from "@/screens/home/NotificationsScreen";
import { RechercheScreen } from "@/screens/home/RechercheScreen";
import { colors } from "@/theme/colors";
import type { PileAccueil } from "./types";

const Stack = createNativeStackNavigator<PileAccueil>();

export function HomeStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={optionsEcran}>
      <Stack.Screen name="Accueil" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Recherche" component={RechercheScreen} options={{ title: t("recherche.titre") }} />
      <Stack.Screen name="Evenements" component={EvenementsScreen} options={{ title: t("evenements.titre") }} />
      <Stack.Screen name="DetailEvenement" component={DetailEvenementScreen} options={{ title: "" }} />
      <Stack.Screen name="Communaute" component={CommunauteScreen} options={{ title: t("communaute.titre") }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: t("notifications.titre") }} />
    </Stack.Navigator>
  );
}

const optionsEcran = {
  headerStyle: { backgroundColor: colors.fond },
  headerTintColor: colors.texte,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.fond },
};
