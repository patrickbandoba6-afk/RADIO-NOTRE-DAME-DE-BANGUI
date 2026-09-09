import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import React from "react";
import { colors } from "@/theme/colors";
import { MainTabs } from "./MainTabs";

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

export function RootNavigator() {
  return (
    <NavigationContainer theme={themeApp}>
      <MainTabs />
    </NavigationContainer>
  );
}
