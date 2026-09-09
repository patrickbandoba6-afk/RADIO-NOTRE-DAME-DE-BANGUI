import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { useTranslation } from "react-i18next";
import { MiniPlayer } from "@/components/MiniPlayer";
import { LiveScreen } from "@/screens/LiveScreen";
import { colors } from "@/theme/colors";
import { CompteStack } from "./CompteStack";
import { HomeStack } from "./HomeStack";
import { MediaStack } from "./MediaStack";
import { PrierStack } from "./PrierStack";
import type { OngletsPrincipaux } from "./types";

const Tab = createBottomTabNavigator<OngletsPrincipaux>();

const ICONES: Record<keyof OngletsPrincipaux, keyof typeof Ionicons.glyphMap> = {
  AccueilStack: "home",
  Direct: "radio",
  MediaStack: "play-circle",
  PrierStack: "heart",
  CompteStack: "person",
};

export function MainTabs() {
  const { t } = useTranslation();
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primaire,
          tabBarInactiveTintColor: colors.texteSecondaire,
          tabBarStyle: { backgroundColor: colors.carte, borderTopColor: colors.separateur },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={ICONES[route.name as keyof OngletsPrincipaux]} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="AccueilStack" component={HomeStack} options={{ title: t("onglets.accueil") }} />
        <Tab.Screen name="Direct" component={LiveScreen} options={{ title: t("onglets.direct") }} />
        <Tab.Screen name="MediaStack" component={MediaStack} options={{ title: t("onglets.media") }} />
        <Tab.Screen name="PrierStack" component={PrierStack} options={{ title: t("onglets.prier") }} />
        <Tab.Screen name="CompteStack" component={CompteStack} options={{ title: t("onglets.compte") }} />
      </Tab.Navigator>
      <MiniPlayer />
    </>
  );
}
