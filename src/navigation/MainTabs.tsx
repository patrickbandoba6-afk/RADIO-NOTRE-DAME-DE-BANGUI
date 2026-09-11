import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { MiniPlayer } from "@/components/MiniPlayer";
import { LiveScreen } from "@/screens/LiveScreen";
import { colors } from "@/theme/colors";
import { ActualitesStack } from "./ActualitesStack";
import { AgendaStack } from "./AgendaStack";
import { HomeStack } from "./HomeStack";
import { MediaStack } from "./MediaStack";
import { MenuStack } from "./MenuStack";
import type { OngletsPrincipaux } from "./types";

const Tab = createBottomTabNavigator<OngletsPrincipaux>();

const ICONES: Record<keyof OngletsPrincipaux, keyof typeof Ionicons.glyphMap> = {
  AccueilStack: "home",
  Direct: "radio",
  ActualitesStack: "newspaper",
  AgendaStack: "calendar",
  PodcastsStack: "headset",
  MenuStack: "menu",
};

const LIBELLES: Record<keyof OngletsPrincipaux, string> = {
  AccueilStack: "Accueil",
  Direct: "Direct",
  ActualitesStack: "Actus",
  AgendaStack: "Agenda",
  PodcastsStack: "Podcasts",
  MenuStack: "Plus",
};

export function MainTabs() {
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primaire,
          tabBarInactiveTintColor: colors.texteSecondaire,
          tabBarStyle: {
            backgroundColor: colors.carte,
            borderTopColor: colors.separateur,
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
          tabBarIcon: ({ color }) => (
            <Ionicons
              name={ICONES[route.name as keyof OngletsPrincipaux]}
              size={21}
              color={color}
            />
          ),
          title: LIBELLES[route.name as keyof OngletsPrincipaux],
        })}
      >
        <Tab.Screen name="AccueilStack" component={HomeStack} />
        <Tab.Screen name="Direct" component={LiveScreen} />
        <Tab.Screen name="ActualitesStack" component={ActualitesStack} />
        <Tab.Screen name="AgendaStack" component={AgendaStack} />
        <Tab.Screen name="PodcastsStack" component={MediaStack} />
        <Tab.Screen name="MenuStack" component={MenuStack} />
      </Tab.Navigator>
      <MiniPlayer />
    </>
  );
}
